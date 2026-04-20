import { Application, Expert, Status } from '../../../types';
import { useApplicationsList } from './useApplicationsList';
import { ApplicationsListFilters } from './ApplicationsListFilters';
import { ApplicationsListControls } from './ApplicationsListControls';
import { ApplicationsListCard } from './ApplicationsListCard';
import type { ApplicationsListProps } from './types';
import './ApplicationsList.css';

export function ApplicationsList({
  applications,
  experts,
  statuses,
  onExpertsAssigned,
  onStatusChanged,
}: ApplicationsListProps) {
  const {
    // Состояние
    filteredApplications,
    selectedIds,
    filters,
    sortField,
    sortOrder,
    assigningExpert1,
    assigningExpert2,
    saving,
    changingStatusId,
    uniqueStatuses,
    uniqueDirections,
    uniqueTenders,

    // Сеттеры
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
  } = useApplicationsList({
    applications,
    experts,
    statuses,
    onExpertsAssigned,
    onStatusChanged,
  });

  // Обработчики для сортировки
  const handleSortChange = (field: any) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Обработчики для экспертов
  const handleAssignExpert1 = (value: number | '') => {
    setAssigningExpert1(value);
  };

  const handleAssignExpert2 = (value: number | '') => {
    setAssigningExpert2(value);
  };

  return (
    <div className="ApplicationsList">
      {/* Панель управления */}
      <div className="ApplicationsList__controls">
        {/* Фильтры */}
        <ApplicationsListFilters
          filters={filters}
          uniqueStatuses={uniqueStatuses}
          uniqueDirections={uniqueDirections}
          uniqueTenders={uniqueTenders}
          experts={experts}
          filteredCount={filteredApplications.length}
          sortField={sortField}
          sortOrder={sortOrder}
          onFilterChange={setFilters}
          onSortChange={handleSortChange}
        />

        {/* Массовые действия */}
        <ApplicationsListControls
          selectedIds={selectedIds}
          filteredApplications={filteredApplications}
          experts={experts}
          assigningExpert1={assigningExpert1}
          assigningExpert2={assigningExpert2}
          saving={saving}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onAssignExpert1={handleAssignExpert1}
          onAssignExpert2={handleAssignExpert2}
          onBulkAssign={handleBulkAssign}
        />
      </div>

      {/* Список карточек */}
      <div className="ApplicationsList__cards">
        {filteredApplications.length === 0 ? (
          <div className="ApplicationsList__empty">Заявки не найдены</div>
        ) : (
          filteredApplications.map(app => (
            <ApplicationsListCard
              key={app.id}
              app={app}
              experts={experts}
              statuses={statuses}
              selectedIds={selectedIds}
              changingStatusId={changingStatusId}
              onSelect={handleSelectOne}
              getStatusVariant={getStatusVariant}
              onStatusChange={handleChangeStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}
