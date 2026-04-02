import { useState, useEffect } from 'react';
import type { Expert } from '../../../types';
import './EditExpertModal.css';

type EditExpertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  expert: Expert | null;
  onSave: (data: { surname: string; name: string; patronymic: string | null; extra_info: string | null }) => Promise<void>;
};

export function EditExpertModal({ isOpen, onClose, expert, onSave }: EditExpertModalProps) {
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
    <div className="EditExpertModal">
      <div className="EditExpertModal__overlay" onClick={onClose} />
      <div className="EditExpertModal__content">
        <div className="EditExpertModal__header">
          <h2 className="EditExpertModal__title">Редактирование эксперта</h2>
          <button
            type="button"
            onClick={onClose}
            className="EditExpertModal__close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="EditExpertModal__form">
          {error && (
            <div className="EditExpertModal__error">{error}</div>
          )}

          <div className="EditExpertModal__grid">
            <div className="EditExpertModal__field">
              <label className="EditExpertModal__label">
                Фамилия <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="EditExpertModal__input"
                placeholder="Фамилия"
                required
              />
            </div>

            <div className="EditExpertModal__field">
              <label className="EditExpertModal__label">
                Имя <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="EditExpertModal__input"
                placeholder="Имя"
                required
              />
            </div>

            <div className="EditExpertModal__field">
              <label className="EditExpertModal__label">Отчество</label>
              <input
                type="text"
                value={patronymic}
                onChange={(e) => setPatronymic(e.target.value)}
                className="EditExpertModal__input"
                placeholder="Отчество"
              />
            </div>

            <div className="EditExpertModal__field EditExpertModal__field--full">
              <label className="EditExpertModal__label">Дополнительная информация</label>
              <textarea
                value={extraInfo}
                onChange={(e) => setExtraInfo(e.target.value)}
                className="EditExpertModal__textarea"
                placeholder="Должность, учёная степень, специализация и т.д."
                rows={4}
              />
            </div>
          </div>

          <div className="EditExpertModal__actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-primary"
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

export default EditExpertModal;
