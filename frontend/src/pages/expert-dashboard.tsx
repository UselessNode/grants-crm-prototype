import { useState, useEffect } from 'react';
import { UserPanelLayout } from '../components/UserPanel/user-panel-layout';
import { expertService } from '../services/expertService';
import { useAuthStore } from '../store/auth-store';
import { Application, Expert } from '../types';
import { Link } from 'react-router-dom';

export function ExpertDashboard() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expertProfile, setExpertProfile] = useState<Expert | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // Загружаем профиль эксперта
      const profileResponse = await expertService.getProfile();
      if (profileResponse.success) {
        setExpertProfile(profileResponse.data);
      }

      // Загружаем заявки эксперта
      const appsResponse = await expertService.getApplications();
      if (appsResponse.success) {
        setApplications(appsResponse.data);

        // Считаем статистику на основе review_status
        const total = appsResponse.data.length;
        const pending = appsResponse.data.filter(
          (app: Application) => !app.review_status || app.review_status === 'draft'
        ).length;
        const approved = appsResponse.data.filter(
          (app: Application) => app.review_status === 'approved'
        ).length;
        const rejected = appsResponse.data.filter(
          (app: Application) => app.review_status === 'rejected'
        ).length;

        setStats({ total, pending, approved, rejected });
      }
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusColor = (statusName?: string) => {
    switch (statusName?.toLowerCase()) {
      case 'черновик':
        return 'bg-gray-100 text-gray-600';
      case 'подана':
        return 'bg-blue-100 text-blue-600';
      case 'на рассмотрении':
        return 'bg-yellow-100 text-yellow-600';
      case 'одобрена':
        return 'bg-green-100 text-green-600';
      case 'отклонена':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getVerdictStatusColor = (reviewStatus?: string) => {
    switch (reviewStatus) {
      case 'approved':
        return 'bg-green-100 text-green-600';
      case 'rejected':
        return 'bg-red-100 text-red-600';
      case 'draft':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getApplicationVerdictStatus = (app: Application) => {
    // Используем поле review_status, которое приходит из API эксперта
    switch (app.review_status) {
      case 'approved':
        return 'Вердикт: Одобрено';
      case 'rejected':
        return 'Вердикт: Отклонено';
      case 'draft':
        return 'Вердикт: Черновик';
      default:
        return 'Ожидает оценки';
    }
  };

  return (
    <UserPanelLayout showTabs={true} useMainNavigation={true}>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500">Загрузка данных...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Заголовок и статистика */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Личный кабинет эксперта</h1>
                {expertProfile && (
                  <p className="text-gray-500 mt-1">
                    {expertProfile.surname} {expertProfile.name} {expertProfile.patronymic}
                    {expertProfile.extra_info && (
                      <span className="block text-sm text-gray-400">{expertProfile.extra_info}</span>
                    )}
                  </p>
                )}
              </div>

              {/* Статистика */}
              <div className="flex gap-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center min-w-[100px]">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-xs text-gray-500">Всего</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center min-w-[100px]">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-xs text-gray-500">Ожидают/Черновики</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center min-w-[100px]">
                  <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                  <div className="text-xs text-gray-500">Одобрено</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center min-w-[100px]">
                  <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                  <div className="text-xs text-gray-500">Отклонено</div>
                </div>
              </div>
            </div>
          </div>

          {/* Список заявок */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Назначенные заявки</h2>
            </div>

            {applications.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                У вас нет назначенных заявок
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Моя оценка</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата создания</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {app.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[300px]">
                          {app.title}
                        </div>
                        {app.direction_name && (
                          <div className="text-xs text-gray-500">{app.direction_name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(app.status_name)}`}>
                          {app.status_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getVerdictStatusColor(app.review_status)}`}>
                          {getApplicationVerdictStatus(app)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.created_at || '').toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/expert/applications/${app.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                        >
                          Просмотр
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Объяснение функционала */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Для эксперта доступно:</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Просмотр всех назначенных заявок</li>
              <li>Детальный просмотр каждой заявки</li>
              <li>Вынесение вердикта (одобрить/отклонить) с комментарием</li>
              <li>Отслеживание статуса решения (если оба эксперта выставили вердикты)</li>
            </ul>
          </div>
        </div>
      )}
    </UserPanelLayout>
  );
}

export default ExpertDashboard;
