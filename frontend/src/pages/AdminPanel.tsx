import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../utils/adminService';
import { useAuthStore } from '../store/authStore';
import type { User } from '../utils/adminService';
import type { Application, Expert } from '../utils/types';
import ApplicationsList from '../components/AdminPanel/ApplicationsList';
import AddExpertModal from '../components/AdminPanel/AddExpertModal';

interface AdminStats {
  users: number;
  applications: number;
}

interface ExpertWithStats extends Expert {
  applicationsCount?: number;
}

/**
 * Страница админ-панели
 */
export function AdminPanel() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'applications' | 'directories' | 'experts'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<(Application & { owner_email?: string; owner_name?: string })[]>([]);
  const [directions, setDirections] = useState<{ id: number; name: string; description?: string | null }[]>([]);
  const [tenders, setTenders] = useState<{ id: number; name: string; description?: string | null }[]>([]);
  const [experts, setExperts] = useState<ExpertWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddExpertModalOpen, setIsAddExpertModalOpen] = useState(false);

  // Проверка прав администратора
  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Доступ запрещён. Требуются права администратора.');
    }
  }, [user]);

  // Загрузка статистики
  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'dashboard') {
      loadStats();
    }
  }, [activeTab, user]);

  // Загрузка пользователей
  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, user]);

  // Загрузка заявок
  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'applications') {
      loadApplications();
      loadExperts(); // Загружаем экспертов для фильтров и назначения
    }
  }, [activeTab, user]);

  // Загрузка справочников
  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'directories') {
      loadDirectories();
    }
  }, [activeTab, user]);

  // Загрузка экспертов
  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'experts') {
      loadExperts();
    }
  }, [activeTab, user]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (err) {
      setError('Ошибка загрузки статистики');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({ limit: 50 });
      setUsers(data.data);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await adminService.getApplications({ limit: 50 });
      setApplications(data.data);
    } catch (err) {
      setError('Ошибка загрузки заявок');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDirectories = async () => {
    setLoading(true);
    try {
      const [dirsData, tendersData] = await Promise.all([
        adminService.getDirections(),
        adminService.getTenders(),
      ]);
      setDirections(dirsData.data);
      setTenders(tendersData.data);
    } catch (err) {
      setError('Ошибка загрузки справочников');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Доступ запрещён</h1>
          <p className="text-red-600 mb-4">{error || 'Требуются права администратора'}</p>
          <Link to="/applications" className="text-blue-600 hover:underline">
            ← Вернуться к заявкам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Админ-панель</h1>
            <Link
              to="/applications"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              ← К заявкам
            </Link>
          </div>
        </div>
      </header>

      {/* Вкладки */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="flex space-x-4 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Обзор' },
              { id: 'users', label: 'Пользователи' },
              { id: 'applications', label: 'Заявки' },
              { id: 'experts', label: 'Эксперты' },
              { id: 'directories', label: 'Справочники' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Контент */}
      <main className="container mx-auto px-6 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Обзор */}
        {activeTab === 'dashboard' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Пользователи</h2>
              <p className="text-4xl font-bold text-blue-600">{stats.users}</p>
              <button
                onClick={() => setActiveTab('users')}
                className="mt-4 text-blue-600 hover:underline text-sm"
              >
                Посмотреть всех →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Заявки</h2>
              <p className="text-4xl font-bold text-green-600">{stats.applications}</p>
              <button
                onClick={() => setActiveTab('applications')}
                className="mt-4 text-blue-600 hover:underline text-sm"
              >
                Посмотреть все →
              </button>
            </div>
          </div>
        )}

        {/* Пользователи */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата регистрации</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{u.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {`${u.surname || ''} ${u.name || ''}`.trim() || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{u.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {u.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('ru-RU') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Заявки */}
        {activeTab === 'applications' && (
          <ApplicationsList
            applications={applications}
            experts={experts}
            onExpertsAssigned={() => {
              loadApplications();
            }}
          />
        )}

        {/* Справочники */}
        {activeTab === 'directories' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Направления */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Направления</h2>
              <ul className="space-y-2">
                {directions.map(d => (
                  <li key={d.id} className="p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-900">{d.name}</div>
                    {d.description && (
                      <div className="text-sm text-gray-500 mt-1">{d.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Конкурсы */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Конкурсы (тендеры)</h2>
              <ul className="space-y-2">
                {tenders.map(t => (
                  <li key={t.id} className="p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-900">{t.name}</div>
                    {t.description && (
                      <div className="text-sm text-gray-500 mt-1">{t.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Эксперты */}
        {activeTab === 'experts' && (
          <div className="experts-list-container">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Список экспертов</h2>
              <button
                onClick={() => setIsAddExpertModalOpen(true)}
                className="btn-add-icon"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Добавить эксперта
              </button>
            </div>
            <table className="experts-table">
              <thead className="experts-table-header">
                <tr>
                  <th className="experts-th">ID</th>
                  <th className="experts-th">ФИО</th>
                  <th className="experts-th">Дополнительная информация</th>
                  <th className="experts-th">Дата добавления</th>
                </tr>
              </thead>
              <tbody>
                {experts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="experts-empty-state">
                      Эксперты ещё не добавлены
                    </td>
                  </tr>
                ) : (
                  experts.map(expert => (
                    <tr key={expert.id} className="experts-table-row">
                      <td className="experts-td">{expert.id}</td>
                      <td className="experts-td">
                        <div className="font-medium text-gray-900">
                          {`${expert.surname || ''} ${expert.name || ''}`.trim() || '—'}
                        </div>
                        {expert.patronymic && (
                          <div className="text-sm text-gray-500">{expert.patronymic}</div>
                        )}
                      </td>
                      <td className="experts-td">
                        {expert.extra_info || (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="experts-td text-gray-500">
                        {expert.created_at ? new Date(expert.created_at).toLocaleDateString('ru-RU') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Модальное окно добавления эксперта */}
      <AddExpertModal
        isOpen={isAddExpertModalOpen}
        onClose={() => setIsAddExpertModalOpen(false)}
        onExpertAdded={() => {
          loadExperts();
        }}
      />
    </div>
  );
}

export default AdminPanel;
