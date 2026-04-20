import { useState, useMemo, useEffect } from 'react';
import { useToast } from '../../../context/toast-context';
import { adminService } from '../../../services/adminService';
import type { Application, Expert, Status } from '../../../types';
import type { FilterState, SortField, SortOrder } from './types';

interface UseApplicationsListParams {
  applications: (Application & { owner_email?: string; owner_name?: string })[];
  experts: Expert[];
  statuses: Status[];
  onExpertsAssigned?: () => void;
  onStatusChanged?: () => void;
}

interface UseApplicationsListReturn {
  // Состояние
  localApplications: (Application & { owner_email?: string; owner_name?: string })[];
  selectedIds: number[];
  filters: FilterState;
  sortField: SortField;
  sortOrder: SortOrder;
  assigningExpert1: number | '';
  assigningExpert2: number | '';
  saving: boolean;
  changingStatusId: number | null;

  // Вычисляемые данные
  filteredApplications: (Application & { owner_email?: string; owner_name?: string })[];
  uniqueStatuses: { id: number; name: string }[];
  uniqueDirections: { id: number; name: string }[];
  uniqueTenders: { id: number; name: string }[];

  // Обработчики
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  setSortField: React.Dispatch<React.SetStateAction<SortField>>;
  setSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>;
  setAssigningExpert1: React.Dispatch<React.SetStateAction<number | ''>>;
  setAssigningExpert2: React.Dispatch<React.SetStateAction<number | ''>>;

  // Функции
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectOne: (id: number) => void;
  handleBulkAssign: () => Promise<void>;
  handleChangeStatus: (applicationId: number, statusId: number) => Promise<void>;
  getStatusVariant: (statusName?: string) => any;
}

export function useApplicationsList({
  applications,
  experts,
  statuses,
  onExpertsAssigned,
  onStatusChanged,
}: UseApplicationsListParams): UseApplicationsListReturn {
  const toast = useToast();

  // Состояние
  const [localApplications, setLocalApplications] = useState<(Application & { owner_email?: string; owner_name?: string })[]>(applications);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status_id: '',
    direction_id: '',
    tender_id: '',
    expert_id: '',
  });
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [assigningExpert1, setAssigningExpert1] = useState<number | ''>('');
  const [assigningExpert2, setAssigningExpert2] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [changingStatusId, setChangingStatusId] = useState<number | null>(null);

  // Синхронизация с пропсами
  useEffect(() => {
    setLocalApplications(applications);
  }, [applications]);

  // Фильтрация заявок
  const filteredApplications = useMemo(() => {
    let result = localApplications.filter(app => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = app.title.toLowerCase().includes(searchLower);
        const ownerMatch = (app.owner_name || '').toLowerCase().includes(searchLower) ||
                          (app.owner_email || '').toLowerCase().includes(searchLower);
        if (!titleMatch && !ownerMatch) return false;
      }
      if (filters.status_id && app.status_id?.toString() !== filters.status_id) return false;
      if (filters.direction_id && app.direction_id?.toString() !== filters.direction_id) return false;
      if (filters.tender_id && app.tender_id?.toString() !== filters.tender_id) return false;
      if (filters.expert_id === '__no_experts__') {
        if (app.expert_1 || app.expert_2) return false;
      } else if (filters.expert_id) {
        const expertId = parseInt(filters.expert_id);
        if (app.expert_1 !== expertId && app.expert_2 !== expertId) return false;
      }
      return true;
    });

    // Сортировка
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'created_at') {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        comparison = dateA - dateB;
      } else if (sortField === 'id') {
        comparison = (a.id || 0) - (b.id || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [localApplications, filters, sortField, sortOrder]);

  // Уникальные значения для фильтров
  const uniqueStatuses = useMemo(() => {
    const statusMap = new Map<number, string>();
    localApplications.forEach(app => {
      if (app.status_id && app.status_name) {
        statusMap.set(app.status_id, app.status_name);
      }
    });
    return Array.from(statusMap.entries()).map(([id, name]) => ({ id, name }));
  }, [localApplications]);

  const uniqueDirections = useMemo(() => {
    const directionMap = new Map<number, string>();
    localApplications.forEach(app => {
      if (app.direction_id && app.direction_name) {
        directionMap.set(app.direction_id, app.direction_name);
      }
    });
    return Array.from(directionMap.entries()).map(([id, name]) => ({ id, name }));
  }, [localApplications]);

  const uniqueTenders = useMemo(() => {
    const tenderMap = new Map<number, string>();
    localApplications.forEach(app => {
      if (app.tender_id && app.tender_name) {
        tenderMap.set(app.tender_id, app.tender_name);
      }
    });
    return Array.from(tenderMap.entries()).map(([id, name]) => ({ id, name }));
  }, [localApplications]);

  // Обработчики выбора
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredApplications.map(app => app.id!));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Массовое назначение экспертов
  const handleBulkAssign = async () => {
    if (selectedIds.length === 0) {
      toast.warning('Внимание', 'Выберите хотя бы одну заявку');
      return;
    }
    if (assigningExpert1 === '' && assigningExpert2 === '') {
      toast.warning('Внимание', 'Выберите хотя бы одного эксперта');
      return;
    }
    setSaving(true);
    try {
      await Promise.all(
        selectedIds.map(id =>
          adminService.assignExperts(id, {
            expert1Id: assigningExpert1 === '' ? null : assigningExpert1,
            expert2Id: assigningExpert2 === '' ? null : assigningExpert2,
          })
        )
      );
      toast.success('Успешно', `Эксперты назначены на ${selectedIds.length} заявок(ки)`);
      setSelectedIds([]);
      setAssigningExpert1('');
      setAssigningExpert2('');
      onExpertsAssigned?.();
    } catch (err) {
      toast.error('Ошибка', 'Ошибка при назначении экспертов');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Изменение статуса
  const handleChangeStatus = async (applicationId: number, statusId: number) => {
    setChangingStatusId(applicationId);
    try {
      const response = await adminService.changeStatus(applicationId, { status_id: statusId });

      // Обновляем заявку локально без перезагрузки
      setLocalApplications(prev => prev.map(app =>
        app.id === applicationId
          ? { ...app, status_id: statusId, status_name: response.data.status_name }
          : app
      ));
    } catch (err) {
      toast.error('Ошибка', 'Ошибка при изменении статуса');
      console.error(err);
    } finally {
      setChangingStatusId(null);
    }
  };

  // Вариант бейджа по статусу
  const getStatusVariant = (statusName?: string) => {
    const variants: Record<string, any> = {
      'Черновик': 'status-draft',
      'Подана': 'status-submitted',
      'На рассмотрении': 'status-review',
      'Одобрена': 'status-approved',
      'Отклонена': 'status-rejected',
    };
    return variants[statusName || ''] || 'default';
  };

  return {
    // Состояние
    localApplications,
    selectedIds,
    filters,
    sortField,
    sortOrder,
    assigningExpert1,
    assigningExpert2,
    saving,
    changingStatusId,

    // Вычисляемые данные
    filteredApplications,
    uniqueStatuses,
    uniqueDirections,
    uniqueTenders,

    // Сеттеры
    setSelectedIds,
    setFilters,
    setSortField,
    setSortOrder,
    setAssigningExpert1,
    setAssigningExpert2,

    // Функции
    handleSelectAll,
    handleSelectOne,
    handleBulkAssign,
    handleChangeStatus,
    getStatusVariant,
  };
}
