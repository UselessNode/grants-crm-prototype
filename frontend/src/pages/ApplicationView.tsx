// ApplicationView
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applicationService } from '../utils/applicationService';
import { useAuthStore } from '../store/authStore';
import type { Application, Status } from '../utils/types';
import { UserPanelLayout } from '../components/UserPanel/UserPanelLayout';
import ExpertAssignment from '../components/ApplicationForm/ExpertAssignment';
import { Icon } from '../components/Icon';
import './ApplicationView.css';

export default function ApplicationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [application, setApplication] = useState<Application | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusChanging, setStatusChanging] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  useEffect(() => {
    const loadApplication = async () => {
      try {
        const [appData, statusesData] = await Promise.all([
          applicationService.getApplication(parseInt(id!)),
          applicationService.getStatuses(),
        ]);
        setApplication(appData.data);
        setStatuses(statusesData.data);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        alert('Ошибка при загрузке заявки');
        navigate('/applications');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadApplication();
    }
  }, [id]);

  const handleDelete = async () => {
    // Проверяем, можно ли удалить заявку
    if (application?.status_name !== 'Черновик' && application?.status_name !== 'Отклонена') {
      alert('Нельзя удалить заявку в текущем статусе');
      return;
    }

    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;

    try {
      await applicationService.deleteApplication(parseInt(id!));
      navigate('/applications');
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка при удалении заявки');
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Вы уверены, что хотите подать эту заявку? После подачи редактирование будет недоступно.')) return;

    try {
      await applicationService.submitApplication(parseInt(id!));
      alert('Заявка успешно подана!');
      // Перезагружаем данные
      const data = await applicationService.getApplication(parseInt(id!));
      setApplication(data.data);
    } catch (error) {
      console.error('Ошибка подачи:', error);
      alert('Ошибка при подаче заявки');
    }
  };

  const handleStatusChange = async (newStatusId: number) => {
    if (!application) return;

    const newStatus = statuses.find(s => s.id === newStatusId);
    if (!confirm(`Вы уверены, что хотите изменить статус заявки на "${newStatus?.name}"?`)) {
      setIsEditingStatus(false);
      return;
    }

    setStatusChanging(true);
    try {
      await applicationService.updateApplicationStatus(parseInt(id!), newStatusId);
      alert('Статус успешно изменён!');
      const data = await applicationService.getApplication(parseInt(id!));
      setApplication(data.data);
      setIsEditingStatus(false);
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      alert('Ошибка при изменении статуса');
      setIsEditingStatus(false);
    } finally {
      setStatusChanging(false);
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
  // Пользователь может редактировать в статусах: Черновик, Одобрена, Отклонена
  // Администратор может редактировать в любом статусе
  const canEdit = (statusName?: string) => {
    if (user?.role === 'admin') {
      return true;
    }
    return statusName === 'Черновик' || statusName === 'Одобрена' || statusName === 'Отклонена';
  };

  // Проверка, можно ли подать заявку
  const canSubmit = (statusName?: string) => {
    return statusName === 'Черновик';
  };

  // Проверка, можно ли удалить заявку
  const canDelete = (statusName?: string) => {
    return statusName === 'Черновик' || statusName === 'Отклонена';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Заявка не найдена</div>
      </div>
    );
  }

  return (
    <UserPanelLayout title="Просмотр заявки">
      <div className="flex gap-6">
        {/* Основной контент */}
        <div className="flex-1">
          {/* Заголовок с кнопками */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Просмотр заявки</h2>
            <div className="flex gap-2">
              {canEdit(application.status_name) ? (
                <Link to={`/applications/${application.id}/edit`} className="btn-header inline-flex items-center gap-2">
                  <Icon name="edit" size={18} />
                  Редактировать
                </Link>
              ) : (
                <span className="px-4 py-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed inline-flex items-center gap-2" title="Редактирование доступно только для черновиков и отклонённых заявок">
                  <Icon name="edit" size={18} />
                  Редактировать
                </span>
              )}
              {canSubmit(application.status_name) ? (
                <button onClick={handleSubmit} className="px-4 btn-primary inline-flex items-center gap-2">
                  <Icon name="check" size={18} />
                  Подать
                </button>
              ) : (
                <span className="px-4 py-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed inline-flex items-center gap-2" title="Подать заявку можно только из статуса «Черновик»">
                  <Icon name="check" size={18} />
                  Подать
                </span>
              )}
              <Link to="/applications" className="btn-cancel inline-flex items-center gap-2">
                <Icon name="arrow-left" size={18} />
                Вернуться
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {/* Заголовок и статус */}
            <div className="application-info-container">
              <div>
                <h2 className="application-title">{application.title}</h2>
                <p className="application-subtitle">
                  Заявка №{application.id} от {application.created_at ? new Date(application.created_at).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '—'}
                </p>
              </div>
              {user?.role === 'admin' ? (
                <div className="flex items-center gap-2">
                  {!isEditingStatus ? (
                    <>
                      <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(application.status_name)}`}>
                        {application.status_name || '—'}
                      </span>
                      <button
                        onClick={() => setIsEditingStatus(true)}
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Изменить статус"
                      >
                        <Icon name="edit" size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={application.status_id || ''}
                        onChange={(e) => handleStatusChange(parseInt(e.target.value))}
                        disabled={statusChanging}
                        className="filter-select text-sm font-medium"
                        style={{ minWidth: '180px' }}
                        autoFocus
                      >
                        {statuses.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setIsEditingStatus(false)}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title="Отменить"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(application.status_name)}`}>
                  {application.status_name || '—'}
                </span>
              )}
            </div>

            {/* Основная информация */}
            <div className="application-data-grid">
              <div>
                <h3 className="application-data-label">Направление</h3>
                <p className="application-data-value">{application.direction_name || 'Не выбрано'}</p>
              </div>
              <div>
                <h3 className="application-data-label">Конкурс</h3>
                <p className="application-data-value">{application.tender_name || 'Не выбран'}</p>
              </div>
              <div>
                <h3 className="application-data-label">Дата подачи</h3>
                <p className="application-data-value">
                  {application.submitted_at
                    ? new Date(application.submitted_at).toLocaleDateString('ru-RU')
                    : 'Не подана'}
                </p>
              </div>
              <div>
                <h3 className="application-data-label">Участников</h3>
                <p className="application-data-value">
                  {application.team_members?.length || 0}
                </p>
              </div>
            </div>

            {/* Координаторы */}
            {application.project_coordinators && application.project_coordinators.length > 0 && (
              <div className="application-section">
                <h3 className="application-section-title">Координаторы проекта</h3>
                <div className="mt-3 space-y-3">
                  {application.project_coordinators.map((coord, index) => (
                    <div key={coord.id || index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">
                        {coord.surname} {coord.name} {coord.patronymic}
                      </p>
                      {coord.relation_to_team && (
                        <p className="text-sm text-gray-600 mt-1">{coord.relation_to_team}</p>
                      )}
                      {coord.contact_info && (
                        <p className="text-sm text-gray-600">{coord.contact_info}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Бюджет */}
            {application.project_budget && application.project_budget.length > 0 && (
              <div className="application-section">
                <h3 className="application-section-title">Бюджет проекта</h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ресурс</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Цена</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Кол-во</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Сумма</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Грант</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Свои</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {application.project_budget.map((item, index) => (
                        <tr key={item.id || index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.resource_type}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {item.unit_cost ? `${item.unit_cost.toLocaleString('ru-RU')} ₽` : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity || '—'}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            {item.total_cost ? `${item.total_cost.toLocaleString('ru-RU')} ₽` : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-700 text-right">
                            {item.grant_funds ? `${item.grant_funds.toLocaleString('ru-RU')} ₽` : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-blue-700 text-right">
                            {item.own_funds ? `${item.own_funds.toLocaleString('ru-RU')} ₽` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* План проекта (даты мероприятия) */}
            {application.project_plans && application.project_plans.length > 0 && (
              <div className="application-section">
                <h3 className="application-section-title">План мероприятия</h3>
                <div className="mt-3 space-y-3">
                  {application.project_plans.map((plan, index) => (
                    <div key={plan.id || index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{plan.event_name}</p>
                        {(plan.start_date || plan.end_date) && (
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {plan.start_date ? new Date(plan.start_date).toLocaleDateString('ru-RU') : '—'}
                            {' – '}
                            {plan.end_date ? new Date(plan.end_date).toLocaleDateString('ru-RU') : '—'}
                          </span>
                        )}
                      </div>
                      {plan.event_description && (
                        <p className="text-sm text-gray-600">{plan.event_description}</p>
                      )}
                      {plan.task && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Задача:</span> {plan.task}
                        </p>
                      )}
                      {plan.results && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Результат:</span> {plan.results}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Описание проекта */}
            <div className="application-section">
              <section>
                <h3 className="application-section-title">Описание идеи</h3>
                <p className="application-section-text">{application.idea_description}</p>
              </section>

              <section>
                <h3 className="application-section-title">Важность для команды</h3>
                <p className="application-section-text">{application.importance_to_team}</p>
              </section>

              <section>
                <h3 className="application-section-title">Цель проекта</h3>
                <p className="application-section-text">{application.project_goal}</p>
              </section>

              <section>
                <h3 className="application-section-title">Задачи проекта</h3>
                <p className="application-section-text">{application.project_tasks}</p>
              </section>

              {application.implementation_experience && (
                <section>
                  <h3 className="application-section-title">Опыт реализации</h3>
                  <p className="application-section-text">{application.implementation_experience}</p>
                </section>
              )}

              {application.results_description && (
                <section>
                  <h3 className="application-section-title">Ожидаемые результаты</h3>
                  <p className="application-section-text">{application.results_description}</p>
                </section>
              )}
            </div>

            {/* Кнопка удаления */}
            <div className="application-delete-container mt-6 pt-6 border-t">
              {canDelete(application.status_name) ? (
                <button onClick={handleDelete} className="application-delete-button inline-flex items-center gap-2">
                  <Icon name="trash" size={18} />
                  Удалить заявку
                </button>
              ) : (
                <span className="text-gray-400 cursor-not-allowed inline-flex items-center gap-2" title="Удаление доступно только для черновиков и отклонённых заявок">
                  <Icon name="trash" size={18} />
                  Удалить заявку
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Сайдбар с экспертами */}
        {user?.role === 'admin' && (
          <aside className="w-80 flex-shrink-0">
            <div className="sidebar-card">
              <h3 className="sidebar-title">Эксперты</h3>

              {/* Назначение экспертов */}
              <ExpertAssignment
                applicationId={application.id!}
                currentExpert1Id={application.expert_1}
                currentExpert2Id={application.expert_2}
                onSuccess={() => {
                  applicationService.getApplication(parseInt(id!)).then(data => {
                    setApplication(data.data);
                  });
                }}
              />
            </div>
          </aside>
        )}
      </div>
    </UserPanelLayout>
  );
}
