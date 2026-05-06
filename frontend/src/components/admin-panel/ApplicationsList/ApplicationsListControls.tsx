import { Button } from '../../ui/button';
import type { Expert } from '../../../types';
import { Icon } from '../../common/icon';
import { useState, useEffect, useRef } from 'react';
import { adminService } from '../../../services/adminService';
import api from '../../../services/api';

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
  const [exporting, setExporting] = useState(false);
  const [progressCurrent, setProgressCurrent] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const startPolling = (id: string) => {
    intervalRef.current = window.setInterval(async () => {
      try {
        const resp = await api.get(`/export/${id}`);
        const data = resp.data;
        if (data.progress) {
          setProgressCurrent(data.progress.current || 0);
          setProgressTotal(data.progress.total || 0);
        }
        if (data.status === 'completed') {
          // trigger download
          const baseURL = api.defaults.baseURL?.replace(/\/$/, '') || '';
          const downloadUrl = `${baseURL}/export/${id}/download`;
          window.location.href = downloadUrl;
          setExporting(false);
          if (intervalRef.current) window.clearInterval(intervalRef.current);
        }
        if (data.status === 'failed') {
          alert('Ошибка генерации: ' + (data.error || 'неизвестная ошибка'));
          setExporting(false);
          if (intervalRef.current) window.clearInterval(intervalRef.current);
        }
      } catch (err) {
        console.error('Poll error', err);
      }
    }, 2000);
  };

  const handleExport = async () => {
    if (selectedIds.length === 0) return;
    setExporting(true);
    try {
      const res = await adminService.exportApplications(selectedIds);
      const id = res.jobId;
      setJobId(id);
      setProgressCurrent(0);
      setProgressTotal(selectedIds.length);
      startPolling(id);
    } catch (err) {
      console.error('Export start error', err);
      alert('Ошибка при старте задачи экспорта');
      setExporting(false);
    }
  };

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
      <button className="ApplicationsList__exportButton" onClick={handleExport} disabled={exporting}>
        <Icon name="download" size={16} />
      </button>

      {exporting && (
        <div className="ApplicationsList__exportProgress">
          Генерация... {progressCurrent}/{progressTotal}
        </div>
      )}

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
