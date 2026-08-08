// THIS IS CORRECT

import { useState } from 'react';
import { adminService } from '../../../services/adminService';
import './AddExpertModal.css';
import Icon from '../../common/icon';

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
  email: string;
  password: string;
  confirmPassword: string;
  specialization_id?: number | null;
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
    email: '',
    password: '',
    confirmPassword: '',
    specialization_id: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.surname || !formData.name) {
      setError('Фамилия и имя обязательны');
      return;
    }

    if (!formData.email) {
      setError('Email обязателен');
      return;
    }

    if (!formData.password) {
      setError('Пароль обязателен');
      return;
    }

    if (!formData.confirmPassword) {
      setError('Подтвердите пароль');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
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
        email: formData.email,
        password: formData.password,
        specialization_id: formData.specialization_id || null,
      });
      onClose();
      setFormData({
        surname: '',
        name: '',
        patronymic: '',
        extra_info: '',
        email: '',
        password: '',
        confirmPassword: '',
        specialization_id: null,
      });
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
    <div className="AddExpertModal">
      <div className="AddExpertModal__overlay" onClick={onClose} />
      <div className="AddExpertModal__content">
        <div className="AddExpertModal__header">
          <h2 className="AddExpertModal__title">Добавить эксперта</h2>
          <button
            type="button"
            onClick={onClose}
            className="AddExpertModal__close"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="AddExpertModal__form">
          {error && (
            <div className="AddExpertModal__error">{error}</div>
          )}

          <div className="AddExpertModal__grid">
            <div className="AddExpertModal__field AddExpertModal__field--full">
              <label className="AddExpertModal__label">
                Email <span className="required-mark">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="AddExpertModal__input"
                placeholder="expert@mail.ru"
              />
            </div>

            <div className="AddExpertModal__field AddExpertModal__field--full">
              <label className="AddExpertModal__label">
                Пароль <span className="required-mark">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="AddExpertModal__input"
                placeholder="Введите пароль"
              />
            </div>

            <div className="AddExpertModal__field AddExpertModal__field--full">
              <label className="AddExpertModal__label">
                Подтверждение пароля <span className="required-mark">*</span>
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="AddExpertModal__input"
                placeholder="Подтвердите пароль"
              />
            </div>

            <div className="AddExpertModal__field">
              <label className="AddExpertModal__label">
                Фамилия <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                className="AddExpertModal__input"
                placeholder="Иванов"
              />
            </div>

            <div className="AddExpertModal__field">
              <label className="AddExpertModal__label">
                Имя <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="AddExpertModal__input"
                placeholder="Иван"
              />
            </div>

            <div className="AddExpertModal__field">
              <label className="AddExpertModal__label">Отчество</label>
              <input
                type="text"
                value={formData.patronymic}
                onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
                className="AddExpertModal__input"
                placeholder="Иванович"
              />
            </div>

            <div className="AddExpertModal__field AddExpertModal__field--full">
              <label className="AddExpertModal__label">Дополнительная информация</label>
              <textarea
                value={formData.extra_info}
                onChange={(e) => setFormData({ ...formData, extra_info: e.target.value })}
                className="AddExpertModal__textarea"
                rows={3}
                placeholder="Комментарий, специализация, контакты..."
              />
            </div>
          </div>

          <div className="AddExpertModal__actions">
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
