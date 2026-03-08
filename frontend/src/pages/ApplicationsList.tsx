// ApplicationsList.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../utils/applicationService';
import type { Application, Direction, Status } from '../utils/types';
import UserHeader from '../components/UserHeader';

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
  const handleDelete = async (id: number, statusName?: string) => {
    // Проверяем, можно ли удалить заявку по статусу
    if (statusName !== 'Черновик' && statusName !== 'Отклонена') {
      alert('Нельзя удалить заявку в текущем статусе');
      return;
    }

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

  // Проверка, можно ли редактировать заявку
  const canEdit = (statusName?: string) => {
    return statusName === 'Черновик' || statusName === 'Отклонена';
  };

  // Проверка, можно ли удалить заявку
  const canDelete = (statusName?: string) => {
    return statusName === 'Черновик' || statusName === 'Отклонена';
  };

  return (
    <div className="applications-list-page bg-gray-50">
      <UserHeader />

      <main className="page-main-lg">
        {/* Заголовок с кнопкой */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Заявки</h2>
          <Link
            to="/applications/new"
            className="btn-header"
          >
            + Новая заявка
          </Link>
        </div>

        {/* Фильтры */}
        <div className="filters-container">
          <div className="filters-grid">
            <div>
              <label className="filter-label">
                Поиск
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Название или описание..."
                className="filter-input"
              />
            </div>

            <div>
              <label className="filter-label">
                Направление
              </label>
              <select
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">Все направления</option>
                {directions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="filter-label">
                Статус
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">Все статусы</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="filter-label">
                На странице
              </label>
              <select
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                className="filter-select"
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
        <div className="applications-table-container">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Загрузка...</div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Заявок не найдено. <Link to="/applications/new" className="text-indigo-600 hover:underline">Создайте первую!</Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="applications-table">
                  <thead className="applications-table-header">
                    <tr>
                      <th className="applications-th">ID</th>
                      <th className="applications-th">Название</th>
                      <th className="applications-th">Направление</th>
                      <th className="applications-th">Статус</th>
                      <th className="applications-th">Дата создания</th>
                      <th className="applications-th">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="applications-tbody">
                    {applications.map((app) => (
                      <tr key={app.id} className="applications-table-row">
                        <td className="applications-td">#{app.id}</td>
                        <td className="applications-td-title">
                          <span className="text-sm font-medium text-gray-900">{app.title}</span>
                        </td>
                        <td className="applications-td">{app.direction_name || '—'}</td>
                        <td className="applications-td">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(app.status_name)}`}>
                            {app.status_name || '—'}
                          </span>
                        </td>
                        <td className="applications-td">
                          {app.created_at ? new Date(app.created_at).toLocaleDateString('ru-RU') : '—'}
                        </td>
                        <td className="applications-td-text">
                          <Link to={`/applications/${app.id}`} className="applications-action-link">
                            Просмотр
                          </Link>
                          {/*{canEdit(app.status_name) ? (
                            <Link to={`/applications/${app.id}/edit`} className="applications-action-link-edit">
                              Редактировать
                            </Link>
                          ) : (
                            <span className="text-gray-400 cursor-not-allowed" title="Редактирование доступно только для черновиков и отклонённых заявок">
                              Редактировать
                            </span>
                          )}*/}
                          {canDelete(app.status_name) ? (
                            <button onClick={() => app.id && handleDelete(app.id, app.status_name)} className="applications-action-button-delete">
                              Удалить
                            </button>
                          ) : (
                            <span className="text-gray-400 cursor-not-allowed" title="Удаление доступно только для черновиков и отклонённых заявок">
                              Удалить
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Пагинация */}
              <div className="pagination-container">
                <div className="pagination-info">Показано {applications.length} из {totalItems} заявок</div>
                <div className="pagination-buttons">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="pagination-button">← Назад</button>
                  <span className="px-3 py-1 text-gray-700">Страница {page} из {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="pagination-button">Вперед →</button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
