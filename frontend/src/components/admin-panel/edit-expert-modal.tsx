import { useState, useEffect } from 'react';
import type { Expert } from '../../types';

type EditExpertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  expert: Expert | null;
  onSave: (data: { surname: string; name: string; patronymic: string | null; extra_info: string | null }) => Promise<void>;
};

export default function EditExpertModal({ isOpen, onClose, expert, onSave }: EditExpertModalProps) {
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expert) {
      setSurname(expert.surname || '');
      setName(expert.name || '');
      setPatronymic(expert.patronymic || '');
      setExtraInfo(expert.extra_info || '');
    }
  }, [expert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave({ surname, name, patronymic, extra_info: extraInfo });
      onClose();
    } catch (err) {
      setError('Ошибка сохранения данных');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !expert) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Редактирование эксперта</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Фамилия <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="input w-full"
                placeholder="Фамилия"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
                placeholder="Имя"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Отчество
              </label>
              <input
                type="text"
                value={patronymic}
                onChange={(e) => setPatronymic(e.target.value)}
                className="input w-full"
                placeholder="Отчество"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дополнительная информация
              </label>
              <textarea
                value={extraInfo}
                onChange={(e) => setExtraInfo(e.target.value)}
                className="field-textarea w-full"
                placeholder="Должность, учёная степень, специализация и т.д."
                rows={4}
              />
            </div>

            <div className="text-sm text-gray-500">
              {expert.created_at && (
                <p>Дата добавления: <span className="text-gray-900">{new Date(expert.created_at).toLocaleDateString('ru-RU')}</span></p>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-cancel"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
