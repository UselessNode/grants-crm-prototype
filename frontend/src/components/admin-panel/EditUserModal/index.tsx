import { useState, useEffect } from 'react';
import type { User } from '../../../services/adminService';
import './EditUserModal.css';

type EditUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (data: { surname: string | null; name: string | null; patronymic: string | null; role_id: number }) => Promise<void>;
};

export default function EditUserModal({ isOpen, onClose, user, onSave }: EditUserModalProps) {
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [roleId, setRoleId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSurname(user.surname || '');
      setName(user.name || '');
      setPatronymic(user.patronymic || '');
      setRoleId(user.role_id || 1);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave({ surname, name, patronymic, role_id: roleId });
      onClose();
    } catch (err) {
      setError('Ошибка сохранения данных');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="EditUserModal">
      <div className="EditUserModal__overlay" onClick={onClose} />
      <div className="EditUserModal__content">
        <div className="EditUserModal__header">
          <h2 className="EditUserModal__title">Редактирование пользователя</h2>
          <button
            type="button"
            onClick={onClose}
            className="EditUserModal__close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="EditUserModal__form">
          {error && (
            <div className="EditUserModal__error">{error}</div>
          )}

          <div className="EditUserModal__grid">
            <div className="EditUserModal__field">
              <label className="EditUserModal__label">Фамилия</label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="EditUserModal__input"
                placeholder="Фамилия"
              />
            </div>

            <div className="EditUserModal__field">
              <label className="EditUserModal__label">
                Имя <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="EditUserModal__input"
                placeholder="Имя"
                required
              />
            </div>

            <div className="EditUserModal__field">
              <label className="EditUserModal__label">Отчество</label>
              <input
                type="text"
                value={patronymic}
                onChange={(e) => setPatronymic(e.target.value)}
                className="EditUserModal__input"
                placeholder="Отчество"
              />
            </div>

            <div className="EditUserModal__field">
              <label className="EditUserModal__label">Роль</label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(Number(e.target.value))}
                className="EditUserModal__select"
              >
                <option value={1}>Пользователь</option>
                <option value={2}>Администратор</option>
              </select>
            </div>
          </div>

          <div className="EditUserModal__actions">
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
