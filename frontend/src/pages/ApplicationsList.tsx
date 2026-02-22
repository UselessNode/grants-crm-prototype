// ApplicationsList.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../utils/applicationService';
import type { Application, Direction, Status } from '../utils/types';

export default function ApplicationsList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Фильтры
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [limit, setLimit] = useState(10);

  // Загрузка данных
  const loadData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (search) params.search = search;
      if (directionFilter) params.direction_id = parseInt(directionFilter);
      if (statusFilter) params.status_id = parseInt(statusFilter);

      const [appsData, directionsData, statusesData] = await Promise.all([
        applicationService.getApplications(params),
        applicationService.getDirections(),
        applicationService.getStatuses(),
      ]);

      setApplications(appsData.data);
      setDirections(directionsData.data);
      setStatuses(statusesData.data);
      setTotalPages(appsData.pagination.pages);
      setTotalItems(appsData.pagination.total);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, limit]);

  // Поиск с debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, directionFilter, statusFilter]);

  // Удаление заявки
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;

    try {
      await applicationService.deleteApplication(id);
      loadData();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка при удалении заявки');
    }
  };

  const getStatusColor = (statusName?: string) => {
    const colors: Record<string, string> = {
      'Черновик': 'bg-gray-100 text-gray-800',
      'Подана': 'bg-blue-100 text-blue-800',
      'На рассмотрении': 'bg-yellow-100 text-yellow-800',
      'Одобрена': 'bg-green-100 text-green-800',
      'Отклонена': 'bg-red-100 text-red-800',
    };
    return colors[statusName || ''] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Заявки на гранты</h1>
          <Link
            to="/applications/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            + Новая заявка
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {/* Фильтры */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Поиск
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Название или описание..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Направление
              </label>
              <select
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Все направления</option>
                {directions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Все статусы</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                На странице
              </label>
              <select
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Таблица заявок */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Загрузка...</div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Заявок не найдено. <Link to="/applications/new" className="text-indigo-600 hover:underline">Создайте первую!</Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Название
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Направление
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата создания
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{app.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{app.title}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.direction_name || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(app.status_name)}`}>
                            {app.status_name || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.created_at ? new Date(app.created_at).toLocaleDateString('ru-RU') : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/applications/${app.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                            Просмотр
                          </Link>
                          <Link to={`/applications/${app.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-3">
                            Редактировать
                          </Link>
                          <button
                            onClick={() => app.id && handleDelete(app.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Пагинация */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Показано {applications.length} из {totalItems} заявок
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    ← Назад
                  </button>
                  <span className="px-3 py-1 text-gray-700">
                    Страница {page} из {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Вперед →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
