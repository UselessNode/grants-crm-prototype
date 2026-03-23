import { useState } from 'react';
import { expertService } from '../../utils/expertService';
import type { ExpertVerdict, Expert } from '../../utils/types';

interface ExpertVerdictFormProps {
  applicationId: number;
  expertId: number;
  existingVerdict?: ExpertVerdict | null;
  onSuccess?: () => void;
}

/**
 * Форма выставления вердикта экспертом
 */
export function ExpertVerdictForm({
  applicationId,
  expertId,
  existingVerdict,
  onSuccess,
}: ExpertVerdictFormProps) {
  const [verdict, setVerdict] = useState<'approved' | 'rejected'>(
    existingVerdict?.verdict || 'approved'
  );
  const [comment, setComment] = useState(existingVerdict?.comment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await expertService.addVerdict(applicationId, {
        expertId,
        verdict,
        comment: comment || null,
      });
      setSuccess('Вердикт успешно выставлен');
      onSuccess?.();
    } catch (err) {
      setError('Ошибка при сохранении вердикта');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="section-card">
      <h3 className="section-title mb-4">
        {existingVerdict ? 'Редактировать вердикт' : 'Выставить вердикт'}
      </h3>

      {error && (
        <div className="field-error-lg mb-4">{error}</div>
      )}

      {success && (
        <div className="expert-success-message mb-4">{success}</div>
      )}

      <div className="mb-4">
        <label className="field-label-lg mb-2">Решение</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="verdict"
              value="approved"
              checked={verdict === 'approved'}
              onChange={(e) => setVerdict(e.target.value as 'approved' | 'rejected')}
              className="w-4 h-4 text-green-600"
              disabled={loading}
            />
            <span className="font-medium text-green-700">Одобрить</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="verdict"
              value="rejected"
              checked={verdict === 'rejected'}
              onChange={(e) => setVerdict(e.target.value as 'approved' | 'rejected')}
              className="w-4 h-4 text-red-600"
              disabled={loading}
            />
            <span className="font-medium text-red-700">Отклонить</span>
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="verdict-comment" className="field-label-lg mb-2">
          Комментарий
        </label>
        <textarea
          id="verdict-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="field-textarea min-h-[100px]"
          placeholder="Укажите, что нужно исправить или почему заявка одобрена/отклонена"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-submit"
      >
        {loading ? 'Сохранение...' : 'Сохранить вердикт'}
      </button>
    </form>
  );
}

export default ExpertVerdictForm;
