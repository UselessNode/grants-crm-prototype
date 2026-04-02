// ApplicationsList.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import { adminService } from '../services/adminService';
import { useAuthStore } from '../store/auth-store';
import { Badge, type BadgeProps } from '../components/ui/badge';
import type { Application, Direction, Status, Expert } from '../types';
import { Icon } from '../components/common/icon';
import { UserPanelLayout } from '../components/UserPanel/user-panel-layout';
import { ApplicationsList as AdminApplicationsList } from '../components/admin-panel';

export function ApplicationsList() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusChangingId, setStatusChangingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Фильтры
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [limit, setLimit] = useState(10);

  // Админ-панель (для встроенных функций)
  const [experts, setExperts] = useState<Expert[]>([]);
  const [adminApplications, setAdminApplications] = useState<(Application & { owner_email?: string; owner_name?: string })[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка обычных заявок (для пользователей и вкладки заявок у админа)
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

  // Загрузка данных для админ-панели (только для встроенного списка заявок)
  const loadAdminData = async () => {
    setAdminLoading(true);
    try {
      const data = await adminService.getApplications({ limit: 50 });
      setAdminApplications(data.data);
      setTotalItems(data.pagination.total);
      loadExperts();
      loadStatuses();
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error(err);
    } finally {
      setAdminLoading(false);
    }
  };

  const loadExperts = async () => {
    try {
      const data = await adminService.getExperts();
      setExperts(data.data);
    } catch (err) {
      console.error('Ошибка загрузки экспертов:', err);
    }
  };

  const loadStatuses = async () => {
    try {
      const api = (await import('../services/api')).default;
      const statusesResponse = await api.get('/statuses');
      setStatuses(statusesResponse.data.data || []);
    } catch (err) {
      console.error('Ошибка загрузки статусов:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    } else {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, user?.role]);

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

  // Изменение статуса заявки (для админа)
  const handleStatusChange = async (applicationId: number, newStatusId: number) => {
    const newStatus = statuses.find(s => s.id === newStatusId);
    if (!confirm(`Вы уверены, что хотите изменить статус заявки на "${newStatus?.name}"?`)) {
      loadData(); // Возвращаем старый статус при отмене
      return;
    }

    setStatusChangingId(applicationId);
    try {
      await applicationService.updateApplicationStatus(applicationId, newStatusId);
      loadData();
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      alert('Ошибка при изменении статуса');
      loadData();
    } finally {
      setStatusChangingId(null);
    }
  };

  const getStatusVariant = (statusName?: string): BadgeProps['variant'] => {
    const variants: Record<string, BadgeProps['variant']> = {
      'Черновик': 'status-draft',
      'Подана': 'status-submitted',
      'На рассмотрении': 'status-review',
      'Одобрена': 'status-approved',
      'Отклонена': 'status-rejected',
    };
    return variants[statusName || ''] || 'default';
  };

  // Проверка, можно ли редактировать заявку
  // Пользователь может редактировать в статусах: Черновик, Одобрена, Отклонена
  // Администратор может редактировать в любом статусе
  const canEdit = (statusName?: string) => {
    if (user?.role === 'admin') {
      return true;
    }
    return statusName === 'Черновик' || statusName === 'Одобрена' || statusName === 'Отклонена';
  };

  // Проверка, можно ли удалить заявку
  const canDelete = (statusName?: string) => {
    return statusName === 'Черновик' || statusName === 'Отклонена';
  };

  return (
    <UserPanelLayout showTabs={true} useMainNavigation={true}>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Контент */}
      {adminLoading || loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Вкладка заявок для обычного пользователя */}
          {user?.role !== 'admin' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div></div>
                <Link to="/applications/new" className="btn-header">+ Новая заявка</Link>
              </div>

              {/* Таблица заявок пользователя */}
              <div className="applications-table-container">
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
                            <Badge variant={getStatusVariant(app.status_name)} size="sm">
                              {app.status_name || '—'}
                            </Badge>
                          </td>
                          <td className="applications-td">
                            {app.created_at ? new Date(app.created_at).toLocaleDateString('ru-RU') : '—'}
                          </td>
                          <td className="applications-td-text">
                            <Link to={`/applications/${app.id}`} className="applications-action-link">
                              Просмотр
                            </Link>
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
              </div>
            </>
          )}

          {/* Вкладка заявок для администратора */}
          {user?.role === 'admin' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div></div>
                <Link to="/applications/new" className="btn-header">+ Новая заявка</Link>
              </div>

              <AdminApplicationsList
                applications={adminApplications}
                experts={experts}
                statuses={statuses}
                onExpertsAssigned={() => loadAdminData()}
                onStatusChanged={() => loadAdminData()}
              />
            </>
          )}
        </>
      )}
    </UserPanelLayout>
  );
}

export default ApplicationsList;
