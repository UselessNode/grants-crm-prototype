import { useState } from 'react';
import { adminService } from '../../utils/adminService';
import './AddExpertModal.css';

interface AddExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpertAdded?: () => void;
}

interface ExpertFormData {
  surname: string;
  name: string;
  patronymic: string;
  extra_info: string;
}

export function AddExpertModal({
  isOpen,
  onClose,
  onExpertAdded,
}: AddExpertModalProps) {
  const [formData, setFormData] = useState<ExpertFormData>({
    surname: '',
    name: '',
    patronymic: '',
    extra_info: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.surname || !formData.name) {
      setError('Фамилия и имя обязательны');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await adminService.addExpert({
        surname: formData.surname,
        name: formData.name,
        patronymic: formData.patronymic || null,
        extra_info: formData.extra_info || null,
      });
      onClose();
      setFormData({ surname: '', name: '', patronymic: '', extra_info: '' });
      onExpertAdded?.();
    } catch (err) {
      setError('Ошибка при добавлении эксперта');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-expert-modal">
      <div className="add-expert-modal__overlay" onClick={onClose} />
      <div className="add-expert-modal__content">
        <div className="add-expert-modal__header">
          <h2 className="add-expert-modal__title">Добавить эксперта</h2>
          <button
            type="button"
            onClick={onClose}
            className="add-expert-modal__close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-expert-modal__form">
          {error && (
            <div className="add-expert-modal__error">{error}</div>
          )}

          <div className="add-expert-modal__grid">
            <div className="add-expert-modal__field">
              <label className="add-expert-modal__label">
                Фамилия <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                className="add-expert-modal__input"
                placeholder="Иванов"
              />
            </div>

            <div className="add-expert-modal__field">
              <label className="add-expert-modal__label">
                Имя <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="add-expert-modal__input"
                placeholder="Иван"
              />
            </div>

            <div className="add-expert-modal__field">
              <label className="add-expert-modal__label">Отчество</label>
              <input
                type="text"
                value={formData.patronymic}
                onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
                className="add-expert-modal__input"
                placeholder="Иванович"
              />
            </div>

            <div className="add-expert-modal__field add-expert-modal__field--full">
              <label className="add-expert-modal__label">Дополнительная информация</label>
              <textarea
                value={formData.extra_info}
                onChange={(e) => setFormData({ ...formData, extra_info: e.target.value })}
                className="add-expert-modal__textarea"
                rows={3}
                placeholder="Комментарий, специализация, контакты..."
              />
            </div>
          </div>

          <div className="add-expert-modal__actions">
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
              {loading ? 'Добавление...' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddExpertModal;
