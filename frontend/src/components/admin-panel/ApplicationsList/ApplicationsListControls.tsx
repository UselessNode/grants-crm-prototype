import { Button } from '../../ui/button';
import type { Expert } from '../../../types';

interface ApplicationsListControlsProps {
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

export function ApplicationsListControls({
  selectedIds,
  filteredApplications,
  experts,
  assigningExpert1,
  assigningExpert2,
  saving,
  onSelectAll,
  onAssignExpert1,
  onAssignExpert2,
  onBulkAssign,
}: ApplicationsListControlsProps) {
  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <div className="ApplicationsList__bulkActions">
      <label className="ApplicationsList__checkbox">
        <input
          type="checkbox"
          checked={selectedIds.length === filteredApplications.length && filteredApplications.length > 0}
          onChange={onSelectAll}
        />
        Выбрать все ({selectedIds.length})
      </label>
      <div className="ApplicationsList__assign">
        <span className="ApplicationsList__assignLabel">Назначить экспертов:</span>
        <div className="ApplicationsList__expertsAssign">
          <select
            value={assigningExpert1}
            onChange={(e) => onAssignExpert1(e.target.value ? Number(e.target.value) : '')}
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
            onChange={(e) => onAssignExpert2(e.target.value ? Number(e.target.value) : '')}
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
          onClick={onBulkAssign}
          disabled={saving || (assigningExpert1 === '' && assigningExpert2 === '')}
          loading={saving}
        >
          Назначить
        </Button>
      </div>
    </div>
  );
}
