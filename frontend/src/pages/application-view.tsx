  // ApplicationView
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import { useAuthStore } from '../store/auth-store';
import { useToast } from '../context/toast-context';
import type { Application, Status, AdditionalMaterial, DobroResponsible, ExpertVerdict, TeamMember } from '../types';
import { UserPanelLayout } from '../components/UserPanel/user-panel-layout';
import ExpertAssignment from '../components/ApplicationForm/expert-assignment';
import { Icon } from '../components/common/icon';
import { Badge, type BadgeProps } from '../components/ui/badge';
import './application-view.css';
import { downloadPdf } from '../services/pdf-generator';
import { toNumber } from '../types/format';


// Вспомогательная функция для извлечения сообщения об ошибке
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }
  return 'Неизвестная ошибка';
};

// Форматирование даты
const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Форматирование денежной суммы
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Helpers to normalize coordinator / dobro data shapes
function getCoordinatorPerson(app: Application | null): TeamMember | undefined {
  if (!app) return undefined;
  if ((app as any).coordinator) return (app as any).coordinator as TeamMember;
  if (app.project_coordinators && app.project_coordinators.length) {
    const pc = app.project_coordinators[0] as any;
    if (pc.team_member) return pc.team_member as TeamMember;
    if (app.team_members && pc.team_member_id) {
      return app.team_members.find(m => m.id === pc.team_member_id);
    }
  }
  if (app.team_members) {
    const found = (app.team_members as TeamMember[]).find(m => (m as any).is_coordinator || (m as any).is_project_coordinator);
    if (found) return found;
  }
  return undefined;
}

function getDobroPerson(app: Application | null): TeamMember | undefined {
  if (!app) return undefined;
  const maybe = (app as any).dobro_responsible || app.dobro_responsible;
  if (!maybe) return undefined;
  if (Array.isArray(maybe)) {
    const dr = maybe[0] as any;
    if (dr.team_member) return dr.team_member as TeamMember;
    if (app.team_members && dr.team_member_id) {
      return app.team_members.find(m => m.id === dr.team_member_id);
    }
  } else {
    if ((maybe as any).team_member) return (maybe as any).team_member as TeamMember;
    if ((maybe as any).surname || (maybe as any).name) return maybe as TeamMember;
  }
  return undefined;
}

export function ApplicationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const toast = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusChanging, setStatusChanging] = useState(false);

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
        const message = getErrorMessage(error);
        toast.error('Ошибка загрузки', `Не удалось загрузить заявку: ${message}`);
        navigate('/applications');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadApplication();
    }
  }, [id]);

  const handleExportPdf = async () => {
    const element = document.getElementById('pdf-content');
    if (!element) {
      toast.error('Ошибка', 'Не найден контент для экспорта');
      return;
    }
    await downloadPdf(element, `Заявка-${application.id}.pdf`, {
      orientation: 'portrait',
      format: 'a4',
      printStyles: `
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `,
    });
  };

  const handleDelete = async () => {
    if (application?.status_name !== 'Черновик' && application?.status_name !== 'Отклонена') {
      toast.warning('Внимание', 'Нельзя удалить заявку в текущем статусе');
      return;
    }

    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;

    try {
      await applicationService.deleteApplication(parseInt(id!));
      toast.success('Успешно', 'Заявка удалена');
      navigate('/applications');
    } catch (error) {
      console.error('Ошибка удаления:', error);
      const message = getErrorMessage(error);
      toast.error('Ошибка удаления', `Не удалось удалить заявку: ${message}`);
    }
  };

  const handleSubmit = async () => {
    if (!application) return;

    const membersWithoutConsent = (application.team_members || []).filter(
      m => !m.consent_files || m.consent_files.length === 0
    );

    if (membersWithoutConsent.length > 0) {
      const names = membersWithoutConsent.map(m => `${m.surname} ${m.name}`).join(', ');
      const removed = confirm(
        `ВНИМАНИЕ: У следующих участников отсутствуют файлы согласия на обработку персональных данных:\n\n` +
        `${names}\n\n` +
        `Участники без согласия НЕ СМОГУТ быть поданы вместе с заявкой.\n\n` +
        `Нажмите «ОК», чтобы удалить их и подать заявку, или «Отмена» для возврата.`
      );

      if (!removed) return;

      try {
        const updatedTeamMembers = (application.team_members ?? []).filter(
          m => m.consent_files && m.consent_files.length > 0
        );

        await applicationService.updateApplication(parseInt(id!), {
          team_members: updatedTeamMembers,
        });

        toast.warning(
          'Участники удалены',
          `Удалено участников без согласия: ${membersWithoutConsent.length}. Заявка будет подана без них.`
        );

        const data = await applicationService.getApplication(parseInt(id!));
        setApplication(data.data);
      } catch (error) {
        console.error('Ошибка удаления участников:', error);
        const message = getErrorMessage(error);
        toast.error('Ошибка удаления участников', `Не удалось удалить участников без согласия: ${message}`);
        return;
      }
    }

    if (!confirm('Вы уверены, что хотите подать эту заявку? После подачи редактирование будет недоступно.')) return;

    try {
      await applicationService.submitApplication(parseInt(id!));
      toast.success('Успешно', 'Заявка успешно подана!');
      const data = await applicationService.getApplication(parseInt(id!));
      setApplication(data.data);
    } catch (error) {
      console.error('Ошибка подачи:', error);
      const message = getErrorMessage(error);
      toast.error('Ошибка подачи заявки', `Не удалось подать заявку: ${message}`);
    }
  };

  const handleStatusChange = async (newStatusId: number) => {
    if (!application) return;

    const newStatus = statuses.find(s => s.id === newStatusId);
    if (!confirm(`Вы уверены, что хотите изменить статус заявки на "${newStatus?.name}"?`)) {
      return;
    }

    setStatusChanging(true);
    try {
      await applicationService.updateApplicationStatus(parseInt(id!), newStatusId);
      toast.success('Успешно', 'Статус успешно изменён!');
      const data = await applicationService.getApplication(parseInt(id!));
      setApplication(data.data);
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      const message = getErrorMessage(error);
      toast.error('Ошибка изменения статуса', `Не удалось изменить статус: ${message}`);
    } finally {
      setStatusChanging(false);
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

  const canEdit = (statusName?: string) => {
    if (user?.role === 'admin') return true;
    return statusName === 'Черновик' || statusName === 'Одобрена' || statusName === 'Отклонена';
  };

  const canSubmit = (statusName?: string) => {
    return statusName === 'Черновик';
  };

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

  // Вычисление итогов бюджета
  const budgetTotal = (application.project_budget || []).reduce(
    (acc, item) => {
      const total = toNumber((item as any).total_cost);
      const grant = toNumber((item as any).grant_funds);
      const own = toNumber((item as any).own_funds);
      return { total: acc.total + total, grant: acc.grant + grant, own: acc.own + own };
    },
    { total: 0, grant: 0, own: 0 }
  );

  const coordinatorPerson = getCoordinatorPerson(application);
  const dobroPerson = getDobroPerson(application);

  return (
    <UserPanelLayout showLogout={false}>
      {/* Действия */}
      <div className="application-actions max-w-7xl mx-auto px-4 pt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Просмотр заявки</h2>
          <div className="flex gap-2" >
            {canEdit(application.status_name) ? (
              <Link to={`/applications/${application.id}/edit`} className="btn-header inline-flex items-center gap-2">
                <Icon name="edit" size={16} />
                Редактировать
              </Link>
            ) : (
              <span className="px-3 py-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed inline-flex items-center gap-2 text-sm">
                <Icon name="edit" size={16} />
                Редактировать
              </span>
            )}
            {canSubmit(application.status_name) ? (
              <button onClick={handleSubmit} className="px-3 py-2 btn-primary inline-flex items-center gap-2 text-sm">
                <Icon name="check" size={16} />
                Подать
              </button>
            ) : (
              <span className="px-3 py-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed inline-flex items-center gap-2 text-sm">
                <Icon name="check" size={16} />
                Подать
              </span>
            )}
            {canDelete(application.status_name) ? (
              <button onClick={handleDelete} className="application-delete-button inline-flex items-center gap-2 no-print text-sm">
                <Icon name="trash" size={16} />
                Удалить заявку
              </button>
            ) : (
              <span className="text-gray-400 cursor-not-allowed inline-flex items-center gap-2 text-sm" title="Удаление доступно только для черновиков и отклонённых заявок">
                <Icon name="trash" size={16} />
                Удалить заявку
              </span>
            )}
            <button onClick={handleExportPdf} className="btn-header inline-flex items-center gap-2 text-sm">
              <Icon name="download" size={16} />
              PDF
            </button>
            <Link to="/applications" className="btn-cancel inline-flex items-center gap-2 text-sm">
              <Icon name="arrow-left" size={16} />
              Вернуться
            </Link>
          </div>
        </div>
      </div>

      <div className="application-view-layout">
    <div className="application-left-column">
        {/* Основной контент */}
        <div id="pdf-content" className="application-view-content">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Мета-информация */}
            <div className="application-meta">
              <div className="application-meta-item">
                <span className="application-meta-label">Статус</span>
                <span className="application-meta-value">
                  <Badge variant={getStatusVariant(application.status_name)}>
                    {application.status_name || 'Не указан'}
                  </Badge>
                </span>
              </div>
              {application.tender && (
                <div className="application-meta-item">
                  <span className="application-meta-label">Конкурс</span>
                  <span className="application-meta-value">{application.tender.title}</span>
                </div>
              )}
              {application.direction && (
                <div className="application-meta-item">
                  <span className="application-meta-label">Направление</span>
                  <span className="application-meta-value">{application.direction.name}</span>
                </div>
              )}
              {application.created_at && (
                <div className="application-meta-item">
                  <span className="application-meta-label">Создана</span>
                  <span className="application-meta-value">{formatDate(application.created_at)}</span>
                </div>
              )}
              {(application as any).updated_at && (
                <div className="application-meta-item">
                  <span className="application-meta-label">Обновлена</span>
                  <span className="application-meta-value">{formatDate((application as any).updated_at)}</span>
                </div>
              )}
            </div>

            {/* Название заявки */}
            <div className="application-section">
              <h3 className="application-section-title">Заявка</h3>
              <div className="application-field">
                <div className="application-field-label">Название заявки</div>
                <div className="application-field-value font-semibold text-base">
                  {application.title || 'Без названия'}
                </div>
              </div>
            </div>

            {/* Ответственные лица */}
            <div className="application-section">
              <h3 className="application-section-title">Ответственные лица</h3>

              {/* Координатор проекта */}
              {coordinatorPerson ? (
                <div className="responsible-card mb-3">
                  <div className="info-card-title">Координатор проекта</div>
                  <div className="responsible-name">
                    {coordinatorPerson.surname} {coordinatorPerson.name} {coordinatorPerson.patronymic || ''}
                  </div>
                  <div className="responsible-details">
                    <div>Должность: {coordinatorPerson.position || 'нет данных'}</div>
                    <div>Контакты: {coordinatorPerson.contact_info || 'нет данных'}</div>
                  </div>
                </div>
              ) : (
                <div className="responsible-card mb-3">
                  <div className="info-card-title">Координатор проекта</div>
                  <div className="responsible-name text-gray-500">нет данных</div>
                </div>
              )}

              {/* Ответственный от Добро.ру */}
              {dobroPerson ? (
                <div className="responsible-card">
                  <div className="info-card-title">Ответственный от Добро.ру</div>
                  <div className="responsible-name">
                    {dobroPerson.surname} {dobroPerson.name} {dobroPerson.patronymic || ''}
                  </div>
                  <div className="responsible-details">
                    <div>Должность: {dobroPerson.position || 'нет данных'}</div>
                    <div>Контакты: {dobroPerson.contact_info || 'нет данных'}</div>
                  </div>
                </div>
              ) : (
                <div className="responsible-card">
                  <div className="info-card-title">Ответственный от Добро.ру</div>
                  <div className="responsible-name text-gray-500">нет данных</div>
                </div>
              )}
            </div>

            {/* Команда проекта */}
            {application.team_members && application.team_members.length > 0 && (
              <div className="application-section">
                <h3 className="application-section-title">
                  Команда проекта ({application.team_members.length} чел.)
                </h3>
                <div className="space-y-2">
                  {application.team_members.map((member, index) => (
                    <div key={member.id || index} className="team-member-card">
                      <div className="team-member-name">
                        {index + 1}. {member.surname} {member.name} {member.patronymic || ''}
                        {member.is_minor && <span className="text-xs text-orange-600 ml-2">(несовершеннолетний)</span>}
                      </div>
                      <div className="team-member-details">
                        {member.tasks_in_project && <div>Задачи: {member.tasks_in_project}</div>}
                        {member.contact_info && <div>Контакты: {member.contact_info}</div>}
                        {member.social_media_links && <div>Соцсети: {member.social_media_links}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Описание проекта */}
            <div className="application-section">
              <h3 className="application-section-title">Описание проекта</h3>

              {application.idea_description && (
                <div className="application-field">
                  <div className="application-field-label">Идея проекта</div>
                  <div className="application-field-description">{application.idea_description}</div>
                </div>
              )}

              {application.importance_to_team && (
                <div className="application-field">
                  <div className="application-field-label">Важность для команды</div>
                  <div className="application-field-description">{application.importance_to_team}</div>
                </div>
              )}

              {application.project_goal && (
                <div className="application-field">
                  <div className="application-field-label">Цель проекта</div>
                  <div className="application-field-description">{application.project_goal}</div>
                </div>
              )}

              {application.project_tasks && (
                <div className="application-field">
                  <div className="application-field-label">Задачи проекта</div>
                  <div className="application-field-description">{application.project_tasks}</div>
                </div>
              )}

              {application.implementation_experience && (
                <div className="application-field">
                  <div className="application-field-label">Опыт реализации</div>
                  <div className="application-field-description">{application.implementation_experience}</div>
                </div>
              )}

              {application.results_description && (
                <div className="application-field">
                  <div className="application-field-label">Ожидаемые результаты</div>
                  <div className="application-field-description">{application.results_description}</div>
                </div>
              )}
            </div>

            {/* План проекта */}
            {application.project_plans && application.project_plans.length > 0 && (
              <div className="application-section">
                <h3 className="application-section-title">План реализации</h3>
                <div className="space-y-2">
                  {application.project_plans.map((plan, index) => (
                    <div key={plan.id || index} className="plan-item">
                      <div className="plan-item-header">
                        <div className="plan-item-title">
                          {index + 1}. {plan.task || plan.event_name || 'Без названия'}
                        </div>
                        {(plan.start_date || plan.end_date) && (
                          <div className="plan-item-dates">
                            {formatDate(plan.start_date)} — {formatDate(plan.end_date)}
                          </div>
                        )}
                      </div>
                      <div className="plan-item-details">
                        {plan.event_description && <div>{plan.event_description}</div>}
                        {plan.results && <div>Результаты: {plan.results}</div>}
                        {plan.fixation_form && <div>Форма фиксации: {plan.fixation_form}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Бюджет */}
            {application.project_budget && application.project_budget.length > 0 && (
              <div className="application-section">
                <h3 className="application-section-title">Бюджет проекта</h3>
                <table className="application-table">
                  <thead>
                    <tr>
                      <th>Тип ресурса</th>
                      <th className="text-right">Стоимость ед.</th>
                      <th className="text-right">Кол-во</th>
                      <th className="text-right">Всего</th>
                      <th className="text-right">Свои средства</th>
                      <th className="text-right">Грант</th>
                    </tr>
                  </thead>
                  <tbody>
                    {application.project_budget.map((item, index) => {
                      const hasUnit = item.unit_cost !== null && item.unit_cost !== undefined && item.unit_cost !== '';
                      const hasQty = item.quantity !== null && item.quantity !== undefined && item.quantity !== '';
                      const hasTotal = item.total_cost !== null && item.total_cost !== undefined && item.total_cost !== '';
                      const hasOwn = item.own_funds !== null && item.own_funds !== undefined && item.own_funds !== '';
                      const hasGrant = item.grant_funds !== null && item.grant_funds !== undefined && item.grant_funds !== '';

                      return (
                        <tr key={item.id || index}>
                          <td>{item.resource_type || 'нет данных'}</td>
                          <td className="text-right">{hasUnit ? formatMoney(toNumber((item as any).unit_cost)) : 'нет данных'}</td>
                          <td className="text-right">{hasQty ? toNumber((item as any).quantity) : 'нет данных'}</td>
                          <td className="text-right font-medium">{hasTotal ? formatMoney(toNumber((item as any).total_cost)) : formatMoney(toNumber((item as any).unit_cost) * toNumber((item as any).quantity))}</td>
                          <td className="text-right">{hasOwn ? formatMoney(toNumber((item as any).own_funds)) : 'нет данных'}</td>
                          <td className="text-right">{hasGrant ? formatMoney(toNumber((item as any).grant_funds)) : 'нет данных'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="budget-total">
                  <div className="budget-total-row">
                    <span className="budget-total-label">Свои средства:</span>
                    <span className="budget-total-value">{formatMoney(budgetTotal.own)}</span>
                  </div>
                  <div className="budget-total-row">
                    <span className="budget-total-label">Средства гранта:</span>
                    <span className="budget-total-value">{formatMoney(budgetTotal.grant)}</span>
                  </div>
                  <div className="budget-total-separator"></div>
                  <div className="budget-total-row">
                    <span className="budget-total-label font-bold">Итого:</span>
                    <span className="budget-total-value font-bold">{formatMoney(budgetTotal.total)}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

        {/* Дополнительные материалы */}
        {application.additional_materials && application.additional_materials.length > 0 && (
          <div className="application-additional">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="application-section-title">Дополнительные материалы</h3>
              <div className="space-y-2">
                {application.additional_materials.map((material) => (
                  <div key={material.id} className="material-item">
                    <a
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="material-link"
                    >
                      {material.file_name || 'Файл без названия'}
                    </a>
                    {material.file_size && (
                      <span className="text-xs text-gray-500">{(material.file_size / 1024 / 1024).toFixed(2)} МБ</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Сайдбар с экспертами */}
        {(user?.role === 'admin' || application.expert1 || application.expert2 || (application.expert_verdicts && application.expert_verdicts.length > 0)) && (
          <div className="application-view-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">Эксперты</h3>

              {/* Текущие эксперты */}
              {(application.expert1 || application.expert2) && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Назначенные эксперты:</h4>
                  <div className="space-y-2">
                    {application.expert1 && (
                      <div className="sidebar-expert-item">
                        <span className="sidebar-expert-label">Эксперт 1</span>
                        <span className="sidebar-expert-name">
                          {application.expert1.surname} {application.expert1.name} {application.expert1.patronymic || ''}
                        </span>
                      </div>
                    )}
                    {application.expert2 && (
                      <div className="sidebar-expert-item">
                        <span className="sidebar-expert-label">Эксперт 2</span>
                        <span className="sidebar-expert-name">
                          {application.expert2.surname} {application.expert2.name} {application.expert2.patronymic || ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {user?.role === 'admin' && (
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
              )}

              {/* Экспертные вердикты */}
              {application.expert_verdicts && application.expert_verdicts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Экспертные вердикты:</h4>
                  <div className="space-y-2">
                    {application.expert_verdicts.map((verdict: ExpertVerdict, index) => (
                      <div key={verdict.id || index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">
                          {verdict.expert?.surname} {verdict.expert?.name}
                        </p>
                        <p className="text-sm mt-1">
                          <span className={verdict.verdict === 'approved' ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                            {verdict.verdict === 'approved' ? 'Одобрено' : 'Отклонено'}
                          </span>
                        </p>
                        {verdict.comment && (
                          <p className="text-xs text-gray-600 mt-1">{verdict.comment}</p>
                        )}
                        {verdict.created_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(verdict.created_at)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </UserPanelLayout>
  );
}

export default ApplicationView;
