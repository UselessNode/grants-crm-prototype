import type { Application, Expert, Status } from '../../../types';

// Props основного компонента
export interface ApplicationsListProps {
  applications: (Application & { owner_email?: string; owner_name?: string })[];
  experts: Expert[];
  statuses: Status[];
  onExpertsAssigned?: () => void;
  onStatusChanged?: () => void;
}

// Состояние фильтров
export interface FilterState {
  search: string;
  status_id: string;
  direction_id: string;
  tender_id: string;
  expert_id: string;
}

// Типы для сортировки
export type SortField = 'created_at' | 'id';
export type SortOrder = 'asc' | 'desc';

// Типы для карточки заявки
export interface ApplicationCardProps {
  app: Application & { owner_email?: string; owner_name?: string; owner_id?: number };
  experts: Expert[];
  statuses: Status[];
  selectedIds: number[];
  onSelect: (id: number) => void;
  getStatusVariant: (statusName?: string) => any;
  onStatusChange: (applicationId: number, statusId: number) => void;
}

// Типы для фильтров
export interface ApplicationsListFiltersProps {
  filters: FilterState;
  uniqueStatuses: { id: number; name: string }[];
  uniqueDirections: { id: number; name: string }[];
  uniqueTenders: { id: number; name: string }[];
  experts: Expert[];
  filteredCount: number;
  onFilterChange: (newFilters: FilterState) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
}

// Типы для массовых действий
export interface ApplicationsListControlsProps {
  selectedIds: number[];
  filteredApplications: any[];
  experts: Expert[];
  assigningExpert1: number | '';
  assigningExpert2: number | '';
  saving: boolean;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectOne: (id: number) => void;
  onAssignExpert1: (value: number | '') => void;
  onAssignExpert2: (value: number | '') => void;
  onBulkAssign: () => Promise<void>;
}

// Утилитарные типы
export interface TenderOption {
  id: number;
  name: string;
}

export interface DirectionOption {
  id: number;
  name: string;
}

export interface StatusOption {
  id: number;
  name: string;
}
