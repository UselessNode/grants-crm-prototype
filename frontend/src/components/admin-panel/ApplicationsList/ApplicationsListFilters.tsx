import type { FilterState, SortField, SortOrder } from './types';
import type { Expert } from '../../../types';

interface ApplicationsListFiltersProps {
  filters: FilterState;
  uniqueStatuses: { id: number; name: string }[];
  uniqueDirections: { id: number; name: string }[];
  uniqueTenders: { id: number; name: string }[];
  experts: Expert[];
  filteredCount: number;
  sortField: SortField;
  sortOrder: SortOrder;
  onFilterChange: (newFilters: FilterState) => void;
  onSortChange: (field: SortField) => void;
}

export function ApplicationsListFilters({
  filters,
  uniqueStatuses,
  uniqueDirections,
  uniqueTenders,
  experts,
  filteredCount,
  sortField,
  sortOrder,
  onFilterChange,
  onSortChange,
}: ApplicationsListFiltersProps) {
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      onSortChange(field); // это вызовет смену sortOrder в родителе
    } else {
      onFilterChange({ ...filters }); // просто триггерим обновление
      // Реализация сортировки будет в родительском компоненте
    }
  };

  return (
    <div className="ApplicationsList__filters">
      {/* Первая строка — поиск */}
      <div className="ApplicationsList__searchRow">
        <div className="ApplicationsList__searchField">
          <label className="ApplicationsList__label">Поиск</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="ApplicationsList__input"
            placeholder="Название, владелец..."
          />
        </div>
      </div>

      {/* Вторая строка — результаты, фильтры, сортировка */}
      <div className="ApplicationsList__filtersRow">
        <div className="ApplicationsList__count">
          Найдено: <strong>{filteredCount}</strong>
        </div>

        {/* Сортировка */}
        <div className="ApplicationsList__sortGroup">
          <span className="ApplicationsList__sortLabel">Сортировка:</span>
          <button
            type="button"
            onClick={() => {
              onSortChange('created_at');
            }}
            className={`ApplicationsList__sortBtn ${sortField === 'created_at' ? 'ApplicationsList__sortBtn--active' : ''}`}
            title="Сортировка по дате"
          >
            По дате {sortField === 'created_at' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
          </button>
          <button
            type="button"
            onClick={() => {
              onSortChange('id');
            }}
            className={`ApplicationsList__sortBtn ${sortField === 'id' ? 'ApplicationsList__sortBtn--active' : ''}`}
            title="Сортировка по ID"
          >
            По индексу {sortField === 'id' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
          </button>
        </div>

        <div className="ApplicationsList__filtersGrid">
          <div className="ApplicationsList__field">
            <label className="ApplicationsList__label">Статус</label>
            <select
              value={filters.status_id}
              onChange={(e) => onFilterChange({ ...filters, status_id: e.target.value })}
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
              onChange={(e) => onFilterChange({ ...filters, direction_id: e.target.value })}
              className="ApplicationsList__select"
            >
              <option value="">Все</option>
              {uniqueDirections.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="ApplicationsList__field">
            <label className="ApplicationsList__label">Конкурс</label>
            <select
              value={filters.tender_id}
              onChange={(e) => onFilterChange({ ...filters, tender_id: e.target.value })}
              className="ApplicationsList__select"
            >
              <option value="">Все</option>
              {uniqueTenders.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="ApplicationsList__field">
            <label className="ApplicationsList__label">Эксперт</label>
            <select
              value={filters.expert_id}
              onChange={(e) => onFilterChange({ ...filters, expert_id: e.target.value })}
              className="ApplicationsList__select"
            >
              <option value="">Все</option>
              <option value="__no_experts__">— Без экспертов —</option>
              {experts.map(exp => (
                <option key={exp.id} value={exp.id}>
                  {`${exp.surname || ''} ${exp.name || ''}`.trim()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
