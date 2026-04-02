import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { Badge, type BadgeProps } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Icon } from '../../common/icon';
import type { Application, Expert, Status } from '../../../types';
import './ApplicationsList.css';

interface ApplicationsListProps {
  applications: (Application & { owner_email?: string; owner_name?: string })[];
  experts: Expert[];
  statuses: Status[];
  onExpertsAssigned?: () => void;
  onStatusChanged?: () => void;
}

interface FilterState {
  search: string;
  status_id: string;
  direction_id: string;
  expert_id: string;
}

export function ApplicationsList({
  applications,
  experts,
  statuses,
  onExpertsAssigned,
  onStatusChanged,
}: ApplicationsListProps) {
  const [localApplications, setLocalApplications] = useState<(Application & { owner_email?: string; owner_name?: string })[]>(applications);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status_id: '',
    direction_id: '',
    expert_id: '',
  });
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
    return localApplications.filter(app => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = app.title.toLowerCase().includes(searchLower);
        const ownerMatch = (app.owner_name || '').toLowerCase().includes(searchLower) ||
                          (app.owner_email || '').toLowerCase().includes(searchLower);
        if (!titleMatch && !ownerMatch) return false;
      }
      if (filters.status_id && app.status_id?.toString() !== filters.status_id) return false;
      if (filters.direction_id && app.direction_id?.toString() !== filters.direction_id) return false;
      if (filters.expert_id) {
        const expertId = parseInt(filters.expert_id);
        if (app.expert_1 !== expertId && app.expert_2 !== expertId) return false;
      }
      return true;
    });
  }, [localApplications, filters]);

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

  const handleBulkAssign = async () => {
    if (selectedIds.length === 0) {
      alert('Выберите хотя бы одну заявку');
      return;
    }
    if (assigningExpert1 === '' && assigningExpert2 === '') {
      alert('Выберите хотя бы одного эксперта');
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
      alert(`Эксперты назначены на ${selectedIds.length} заявок(ки)`);
      setSelectedIds([]);
      setAssigningExpert1('');
      setAssigningExpert2('');
      onExpertsAssigned?.();
    } catch (err) {
      alert('Ошибка при назначении экспертов');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

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
      alert('Ошибка при изменении статуса');
      console.error(err);
    } finally {
      setChangingStatusId(null);
    }
  };

  const getStatusVariant = (statusName?: string): BadgeProps['variant'] => {
    const variants: Record<string, BadgeProps['variant']> = {
      'Черновик': 'status-draft',
      'Подана': 'status-submitted',
      'На рассмотрении': 'status-review',
      'Одобрена': 'status-approved',
      'Отклонена': 'status-rejected',
    };
    return variants[statusName || ''] || 'default';
  };

  return (
    <div className="ApplicationsList">
      {/* Панель управления */}
      <div className="ApplicationsList__controls">
        {/* Фильтры */}
        <div className="ApplicationsList__filters">
          {/* Первая строка — поиск */}
          <div className="ApplicationsList__searchRow">
            <div className="ApplicationsList__searchField">
              <label className="ApplicationsList__label">Поиск</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="ApplicationsList__input"
                placeholder="Название, владелец..."
              />
            </div>
          </div>

          {/* Вторая строка — результаты, фильтры, сортировка */}
          <div className="ApplicationsList__filtersRow">
            <div className="ApplicationsList__count">
              Найдено: <strong>{filteredApplications.length}</strong>
            </div>

            <div className="ApplicationsList__filtersGrid">
              <div className="ApplicationsList__field">
                <label className="ApplicationsList__label">Статус</label>
                <select
                  value={filters.status_id}
                  onChange={(e) => setFilters({ ...filters, status_id: e.target.value })}
                  className="ApplicationsList__select"
                >
                  <option value="">Все</option>
                  {uniqueStatuses.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="ApplicationsList__field">
                <label className="ApplicationsList__label">Направление</label>
                <select
                  value={filters.direction_id}
                  onChange={(e) => setFilters({ ...filters, direction_id: e.target.value })}
                  className="ApplicationsList__select"
                >
                  <option value="">Все</option>
                  {uniqueDirections.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="ApplicationsList__field">
                <label className="ApplicationsList__label">Эксперт</label>
                <select
                  value={filters.expert_id}
                  onChange={(e) => setFilters({ ...filters, expert_id: e.target.value })}
                  className="ApplicationsList__select"
                >
                  <option value="">Все</option>
                  {experts.map(exp => (
                    <option key={exp.id} value={exp.id}>
                      {`${exp.surname || ''} ${exp.name || ''}`.trim()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Массовые действия — показываются только при выборе */}
          {selectedIds.length > 0 && (
            <div className="ApplicationsList__bulkActions">
              <label className="ApplicationsList__checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredApplications.length && filteredApplications.length > 0}
                  onChange={handleSelectAll}
                />
                Выбрать все ({selectedIds.length})
              </label>
              <div className="ApplicationsList__assign">
                <span className="ApplicationsList__assignLabel">Назначить экспертов:</span>
                <div className="ApplicationsList__expertsAssign">
                  <select
                    value={assigningExpert1}
                    onChange={(e) => setAssigningExpert1(e.target.value ? Number(e.target.value) : '')}
                    className="ApplicationsList__select"
                    disabled={saving}
                  >
                    <option value="">Эксперт 1</option>
                    {experts.map(exp => (
                      <option key={exp.id} value={exp.id}>
                        {`${exp.surname || ''} ${exp.name || ''}`.trim()}
                      </option>
                    ))}
                  </select>
                  <select
                    value={assigningExpert2}
                    onChange={(e) => setAssigningExpert2(e.target.value ? Number(e.target.value) : '')}
                    className="ApplicationsList__select"
                    disabled={saving}
                  >
                    <option value="">Эксперт 2</option>
                    {experts.map(exp => (
                      <option key={exp.id} value={exp.id}>
                        {`${exp.surname || ''} ${exp.name || ''}`.trim()}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleBulkAssign}
                  disabled={saving || (assigningExpert1 === '' && assigningExpert2 === '')}
                  loading={saving}
                >
                  Назначить
                </Button>
              </div>
            </div>
          )}

        </div>


      </div>

      {/* Список карточек */}
      <div className="ApplicationsList__cards">
        {filteredApplications.length === 0 ? (
          <div className="ApplicationsList__empty">Заявки не найдены</div>
        ) : (
          filteredApplications.map(app => (
            <div key={app.id} className="ApplicationsList__card relative">
              {/* Чекбокс выбора */}
              <div className="ApplicationsList__cardSelect">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(app.id!)}
                  onChange={() => handleSelectOne(app.id!)}
                />
              </div>

              {/* Основная информация */}
              <div className="ApplicationsList__cardMain">
                <div className="ApplicationsList__cardHeader">
                  <span className="ApplicationsList__cardId">№{app.id}</span>
                  <Link
                    to={`/applications/${app.id}`}
                    className="ApplicationsList__cardTitle"
                  >
                    {app.title}
                  </Link>
                </div>
                <div className="ApplicationsList__cardMeta">
                  <div className="ApplicationsList__cardMetaItem">
                    <span className="ApplicationsList__cardMetaLabel">Владелец:</span>
                    <span className="ApplicationsList__cardMetaValue">{app.owner_name || app.owner_email || '—'}</span>
                  </div>
                  <div className="ApplicationsList__cardMetaItem">
                    <span className="ApplicationsList__cardMetaLabel">Статус:</span>
                    <Badge
                      mode="expandable"
                      size="sm"
                      variant={getStatusVariant(app.status_name)}
                      options={statuses.map(s => ({ id: s.id, label: s.name, variant: getStatusVariant(s.name) }))}
                      value={app.status_id ?? undefined}
                      colorizeOptions
                      onSelect={(option) => handleChangeStatus(app.id!, option.id as number)}
                    />
                  </div>
                  <div className="ApplicationsList__cardMetaItem">
                    <span className="ApplicationsList__cardMetaLabel">Направление:</span>
                    <span className="ApplicationsList__cardMetaValue">{app.direction_name || '—'}</span>
                  </div>
                  <div className="ApplicationsList__cardMetaItem">
                    <span className="ApplicationsList__cardMetaLabel">Дата:</span>
                    <span className="ApplicationsList__cardMetaValue">
                      {app.created_at ? new Date(app.created_at).toLocaleDateString('ru-RU') : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Эксперты */}
              <div className="ApplicationsList__cardExperts">
                <div className="ApplicationsList__expertsLabel">Эксперты:</div>
                <div className="ApplicationsList__expertsList">
                  {(() => {
                    const expert1 = experts.find(e => e.id === app.expert_1);
                    const expert2 = experts.find(e => e.id === app.expert_2);
                    return (
                      <>
                        <span className="ExpertTag" title={expert1 ? `${expert1.surname} ${expert1.name}` : 'Не назначен'}>
                          {expert1 ? `${expert1.surname} ${expert1.name}` : 'Не назначен'}
                        </span>
                        <span className="ExpertTag" title={expert2 ? `${expert2.surname} ${expert2.name}` : 'Не назначен'}>
                          {expert2 ? `${expert2.surname} ${expert2.name}` : 'Не назначен'}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Смена статуса через Badge */}
              {/*<div className="ApplicationsList__cardStatusChange">
                <Badge
                  mode="expandable"
                  size="sm"
                  variant={getStatusVariant(app.status_name)}
                  options={statuses.map(s => ({ id: s.id, label: s.name, variant: getStatusVariant(s.name) }))}
                  value={app.status_id ?? undefined}
                  colorizeOptions
                  onSelect={(option) => handleChangeStatus(app.id!, option.id as number)}
                />
              </div>*/}

              {/* Действия */}
              <div className="ApplicationsList__cardActions">
                {/*<Link
                  to={`/applications/${app.id}/edit`}
                  className="ApplicationsList__actionBtn"
                  title="Редактировать"
                >
                  <Icon name="edit" size={18} />
                </Link>*/}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ApplicationsList;
