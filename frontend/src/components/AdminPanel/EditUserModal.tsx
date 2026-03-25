import { useState, useEffect } from 'react';
import type { User } from '../../utils/adminService';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Редактирование пользователя</h2>
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
                Фамилия
              </label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="input w-full"
                placeholder="Фамилия"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя
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
                Роль
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(Number(e.target.value))}
                className="field-select w-full"
              >
                <option value={1}>Пользователь</option>
                <option value={2}>Администратор</option>
              </select>
            </div>

            <div className="text-sm text-gray-500">
              <p>Email: <span className="text-gray-900">{user.email}</span></p>
              {user.created_at && (
                <p>Дата регистрации: <span className="text-gray-900">{new Date(user.created_at).toLocaleDateString('ru-RU')}</span></p>
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
