import { useState, useEffect } from 'react';
import { adminService } from '../../utils/adminService';
import type { Expert } from '../../utils/types';

interface ExpertAssignmentProps {
  applicationId: number;
  currentExpert1Id?: number | null;
  currentExpert2Id?: number | null;
  onSuccess?: () => void;
}

/**
 * Компонент назначения экспертов на заявку
 * Используется в админ-панели при просмотре заявки
 */
export function ExpertAssignment({
  applicationId,
  currentExpert1Id,
  currentExpert2Id,
  onSuccess,
}: ExpertAssignmentProps) {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [expert1Id, setExpert1Id] = useState<number | ''>('');
  const [expert2Id, setExpert2Id] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Загрузка списка экспертов
  useEffect(() => {
    loadExperts();
  }, []);

  // Установка текущих экспертов при изменении пропсов
  useEffect(() => {
    if (currentExpert1Id) setExpert1Id(currentExpert1Id);
    if (currentExpert2Id) setExpert2Id(currentExpert2Id);
  }, [currentExpert1Id, currentExpert2Id]);

  const loadExperts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getExperts();
      setExperts(data.data);
    } catch (err) {
      setError('Ошибка загрузки экспертов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await adminService.assignExperts(applicationId, {
        expert1Id: expert1Id === '' ? null : expert1Id,
        expert2Id: expert2Id === '' ? null : expert2Id,
      });
      setSuccess('Эксперты успешно назначены');
      onSuccess?.();
    } catch (err) {
      setError('Ошибка при назначении экспертов');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="expert-assignment-compact">
      {error && (
        <div className="expert-assignment__error mb-3">{error}</div>
      )}

      {success && (
        <div className="expert-assignment__success mb-3">{success}</div>
      )}

      <div className="space-y-3">
        {/* Первый эксперт */}
        <div>
          <label className="expert-assignment__label">
            Первый эксперт
          </label>
          <select
            value={expert1Id}
            onChange={(e) => setExpert1Id(e.target.value ? Number(e.target.value) : '')}
            className="expert-assignment__select"
            disabled={loading}
          >
            <option value="">Не назначен</option>
            {experts.map((expert) => (
              <option key={expert.id} value={expert.id}>
                {`${expert.surname || ''} ${expert.name || ''}`.trim() || 'Без имени'}
              </option>
            ))}
          </select>
        </div>

        {/* Второй эксперт */}
        <div>
          <label className="expert-assignment__label">
            Второй эксперт
          </label>
          <select
            value={expert2Id}
            onChange={(e) => setExpert2Id(e.target.value ? Number(e.target.value) : '')}
            className="expert-assignment__select"
            disabled={loading}
          >
            <option value="">Не назначен</option>
            {experts.map((expert) => (
              <option key={expert.id} value={expert.id}>
                {`${expert.surname || ''} ${expert.name || ''}`.trim() || 'Без имени'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="expert-assignment__loading">
          <div className="expert-spinner"></div>
          <span className="expert-loading-text">Загрузка...</span>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || loading}
        className="expert-assignment__btn btn-primary btn-sm btn-full"
      >
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>
    </div>
  );
}

export default ExpertAssignment;
