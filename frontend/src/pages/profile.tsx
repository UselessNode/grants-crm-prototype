import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { UserPanelLayout } from '../components/UserPanel/user-panel-layout';
import { Icon } from '../components/common/icon';

export function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    surname: user?.surname || '',
    name: user?.name || '',
    patronymic: user?.patronymic || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // TODO: Вызов API для обновления профиля
      // await api.put('/users/profile', formData);

      // Обновляем локальное состояние
      updateUser({
        surname: formData.surname,
        name: formData.name,
        patronymic: formData.patronymic,
      });

      setSuccess('Профиль успешно обновлён');
      setIsEditing(false);
    } catch (err) {
      setError('Ошибка при сохранении профиля');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Новые пароли не совпадают');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setSaving(true);

    try {
      // TODO: Вызов API для смены пароля
      // await api.put('/users/change-password', {
      //   currentPassword: passwordData.currentPassword,
      //   newPassword: passwordData.newPassword,
      // });

      setSuccess('Пароль успешно изменён');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError('Ошибка при смене пароля');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getFullName = () => {
    if (!user) return '';
    const parts = [user?.surname, user?.name, user?.patronymic].filter(Boolean);
    return parts.join(' ') || 'Не указано';
  };

  return (
    <UserPanelLayout showTabs={true} useMainNavigation={true}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Основная информация */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Личная информация</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
              >
                <Icon name="edit" size={16} />
                Редактировать
              </button>
            )}
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Фамилия
                </label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Отчество
                </label>
                <input
                  type="text"
                  name="patronymic"
                  value={formData.patronymic}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 inline-flex items-center gap-2"
                >
                  <Icon name="check" size={18} />
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      surname: user?.surname || '',
                      name: user?.name || '',
                      patronymic: user?.patronymic || '',
                    });
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Отмена
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Информация об аккаунте */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Информация об аккаунте</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Email</span>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Полное имя</span>
              <p className="text-gray-900">{getFullName()}</p>
            </div>
          </div>
        </div>

        {/* Смена пароля */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Смена пароля</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Текущий пароль
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Новый пароль
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Подтверждение пароля
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 text-green-800 rounded-lg text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 inline-flex items-center gap-2"
            >
              <Icon name="check" size={18} />
              Изменить пароль
            </button>
          </form>
        </div>
      </div>
    </UserPanelLayout>
  );
}

export default Profile;
