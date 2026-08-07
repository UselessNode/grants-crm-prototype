import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserPanelLayout } from '../components/UserPanel/user-panel-layout';
import { expertService } from '../services/expertService';
import { useAuthStore } from '../store/auth-store';
import { Application, TeamMember, ProjectCoordinator, ProjectPlan, ProjectBudget, AdditionalMaterial, ExpertVerdict } from '../types';
import { Badge } from '../components/ui/badge';

// Компонент для отображения текущего статуса вердикта эксперта
function MyVerdictStatus({ verdict, hasFinalVerdict }: { verdict: ExpertVerdict | null; hasFinalVerdict: boolean }) {
  if (!verdict) {
    return <span className="text-sm text-gray-500">Вы не выносили вердикт</span>;
  }

  const getVerdictBadge = () => {
    switch (verdict.verdict) {
      case 'approved':
        return <Badge variant="success">Одобрено</Badge>;
      case 'rejected':
        return <Badge variant="error">Отклонено</Badge>;
      case 'draft':
        return <Badge variant="warning">Черновик</Badge>;
      default:
        return <Badge variant="default">Неизвестно</Badge>;
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">Ваш вердикт:</span>
      {getVerdictBadge()}
      {verdict.verdict === 'draft' && (
        <span className="text-gray-400 text-xs">(не отправлен)</span>
      )}
    </div>
  );
}

export function ExpertApplicationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingDraft, setSubmittingDraft] = useState(false);
  const [verdict, setVerdict] = useState<'approved' | 'rejected' | ''>('');
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const loadApplication = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await expertService.getApplicationDetail(parseInt(id));
      if (response.success) {
        setApplication(response.data);

        // Проверяем, есть ли уже вердикт от этого эксперта
        const existingVerdict = response.data.expert_verdicts?.find(
          (v: ExpertVerdict) => v.expert_id === user?.id
        );
        if (existingVerdict) {
          // Если вердикт черновик, то не выбираем никакой вердикт (остается пустым)
          setVerdict(existingVerdict.verdict === 'draft' ? '' : existingVerdict.verdict);
          setComment(existingVerdict.comment || '');
        }
      } else {
        setError('Не удалось загрузить заявку');
      }
    } catch (err) {
      setError('Ошибка загрузки заявки');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, [id]);

  const handleSaveDraft = async () => {
    if (!id) return;

    setSubmittingDraft(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await expertService.saveDraft(parseInt(id), {
        comment: comment || null,
      });

      if (response.success) {
        setSuccess('Черновик вердикта сохранён');
        await loadApplication();
      } else {
        setError(response.message || 'Ошибка при сохранении черновика');
      }
    } catch (err) {
      setError('Ошибка при сохранении черновика');
      console.error(err);
    } finally {
      setSubmittingDraft(false);
    }
  };

  const handleFinalizeReview = async () => {
    if (!verdict) {
      setError('Пожалуйста, выберите вердикт');
      return;
    }

    if (!id) return;

    setIsFinalizing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await expertService.finalizeReview(parseInt(id), {
        verdict,
        comment: comment || null,
      });

      if (response.success) {
        setSuccess('Финальный вердикт успешно сохранён!');
        await loadApplication();
      } else {
        setError(response.message || 'Ошибка при сохранении финального вердикта');
      }
    } catch (err) {
      setError('Ошибка при сохранении финального вердикта');
      console.error(err);
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleSubmitVerdict = async (e: React.FormEvent) => {
    e.preventDefault();
    // Эта функция оставлена для совместимости, но лучше использовать отдельные функции
    await handleFinalizeReview();
  };

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

  const getMyVerdict = () => {
    // Получаем вердикт текущего эксперта
    if (!application || !user) return null;
    return application.expert_verdicts?.find((v: ExpertVerdict) => v.expert_id === user.id);
  };

  const hasFinalVerdict = () => {
    const myVerdict = getMyVerdict();
    return myVerdict && (myVerdict.verdict === 'approved' || myVerdict.verdict === 'rejected');
  };

  const canEditVerdict = () => {
    // Эксперт может редактировать вердикт если:
    // 1. Он назначен на заявку
    // 2. Заявка в подходящем статусе
    // 3. У него еще нет финального вердикта
    if (!application || !user) return false;

    // Проверяем, что пользователь назначен экспертом на эту заявку
    const isAssigned = application.expert_verdicts?.some((v: ExpertVerdict) => v.expert_id === user.id);

    // Статус должен позволяь экспертизу
    const allowedStatuses = ['Подана', 'На рассмотрении'];
    const hasAllowedStatus = application.status_name && allowedStatuses.includes(application.status_name);

    // Не должно быть финального вердикта
    const myVerdict = getMyVerdict();
    const hasFinal = myVerdict && (myVerdict.verdict === 'approved' || myVerdict.verdict === 'rejected');

    return isAssigned && hasAllowedStatus && !hasFinal;
  };

  const canSubmitVerdict = canEditVerdict;

  if (loading) {
    return (
      <UserPanelLayout showTabs={true} useMainNavigation={true}>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500">Загрузка заявки...</p>
        </div>
      </UserPanelLayout>
    );
  }

  if (error && !application) {
    return (
      <UserPanelLayout showTabs={true} useMainNavigation={true}>
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      </UserPanelLayout>
    );
  }

  if (!application) {
    return (
      <UserPanelLayout showTabs={true} useMainNavigation={true}>
        <div className="text-center py-12 text-gray-500">
          Заявка не найдена
        </div>
      </UserPanelLayout>
    );
  }

  return (
    <UserPanelLayout showTabs={true} useMainNavigation={true}>
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{application.title}</h1>
              <div className="flex gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(application.status_name)}`}>
                  {application.status_name}
                </span>
                {application.direction_name && (
                  <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-600">
                    {application.direction_name}
                  </span>
                )}
                {application.tender_name && (
                  <span className="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-600">
                    {application.tender_name}
                  </span>
                )}
              </div>
              {/* Отображение текущего вердикта эксперта */}
              <div className="mt-3">
                <MyVerdictStatus 
                  verdict={getMyVerdict()}
                  hasFinalVerdict={hasFinalVerdict()}
                />
              </div>
            </div>
            <Link to="/expert" className="btn btn-secondary">
              Назад к списку
            </Link>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Основная информация */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Описание проекта</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Идея проекта</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{application.idea_description}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Важность для команды</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{application.importance_to_team}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Цель проекта</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{application.project_goal}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Задачи проекта</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{application.project_tasks}</p>
            </div>
          </div>

          {application.implementation_experience && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-700 mb-2">Опыт реализации</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{application.implementation_experience}</p>
            </div>
          )}

          {application.results_description && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-700 mb-2">Описание результатов</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{application.results_description}</p>
            </div>
          )}
        </div>

        {/* Команда */}
        {(application.team_members && application.team_members.length > 0) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Команда проекта</h2>
            <div className="space-y-4">
              {application.team_members.map((member: TeamMember) => (
                <div key={member.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium">
                    {member.surname} {member.name} {member.patronymic}
                  </div>
                  <div className="text-sm text-gray-500">{member.tasks_in_project}</div>
                  {member.contact_info && (
                    <div className="text-sm text-blue-600 mt-1">{member.contact_info}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Планы и бюджет */}
        {(application.project_plans && application.project_plans.length > 0) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">План реализации</h2>
            <div className="space-y-4">
              {application.project_plans.map((plan: ProjectPlan) => (
                <div key={plan.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium">{plan.task}: {plan.event_name}</div>
                  {plan.event_description && (
                    <div className="text-sm text-gray-600 mt-1">{plan.event_description}</div>
                  )}
                  {plan.start_date && plan.end_date && (
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(plan.start_date).toLocaleDateString('ru-RU')} —
                      {new Date(plan.end_date).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(application.project_budget && application.project_budget.length > 0) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Бюджет проекта</h2>
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Тип ресурса</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Стоимость</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Количество</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Общая сумма</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Комментарий</th>
                </tr>
              </thead>
              <tbody>
                {application.project_budget.map((budget: ProjectBudget) => (
                  <tr key={budget.id} className="border-t">
                    <td className="px-4 py-2 text-sm">{budget.resource_type}</td>
                    <td className="px-4 py-2 text-sm">{budget.unit_cost?.toLocaleString('ru-RU')} ₽</td>
                    <td className="px-4 py-2 text-sm">{budget.quantity}</td>
                    <td className="px-4 py-2 text-sm">{budget.total_cost?.toLocaleString('ru-RU')} ₽</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{budget.comment || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Форма вердикта */}
        {canEditVerdict() && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Вынести вердикт</h2>
            
            {/* Показываем подсказку, если уже есть черновик */}
            {getMyVerdict()?.verdict === 'draft' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  У вас есть черновик вердикта. Выберите finalный вердикт и нажмите "Отправить финальное решение"
                </p>
              </div>
            )}
            
            <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="verdict"
                    value="approved"
                    checked={verdict === 'approved'}
                    onChange={() => setVerdict('approved')}
                    className="w-4 h-4"
                    disabled={isFinalizing}
                  />
                  <span className="text-green-600 font-medium">Одобрить заявку</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="verdict"
                    value="rejected"
                    checked={verdict === 'rejected'}
                    onChange={() => setVerdict('rejected')}
                    className="w-4 h-4"
                    disabled={isFinalizing}
                  />
                  <span className="text-red-600 font-medium">Отклонить заявку</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Комментарий (необязательно)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Оставьте комментарий к вердикту..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  disabled={isFinalizing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Комментарий будет виден другим экспертам и администраторам
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                {/* Кнопка сохранения черновика (доступна всегда, когда можно редактировать) */}
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={submittingDraft}
                  className="btn btn-secondary disabled:opacity-50"
                  title="Сохранить комментарий как черновик"
                >
                  {submittingDraft ? 'Сохранение...' : 'Сохранить черновик'}
                </button>
                
                {/* Кнопка финального вердикта (доступна только когда выбран вердикт) */}
                <button
                  type="button"
                  onClick={handleFinalizeReview}
                  disabled={isFinalizing || !verdict}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {isFinalizing ? 'Отправка...' : 'Отправить финальное решение'}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/expert')}
                  className="btn btn-cancel"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {!canEditVerdict() && hasFinalVerdict() && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              Вы уже вынесли финальный вердикт по этой заявке. Изменение невозможно.
            </p>
          </div>
        )}
        
        {!canEditVerdict() && !hasFinalVerdict() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              Вы не можете вынести вердикт по этой заявке.
              Возможно, вы не назначены экспертом или заявка находится в статусе, который не позволяет экспертизу.
            </p>
          </div>
        )}

        {/* Существующие вердикты */}
        {(application.expert_verdicts && application.expert_verdicts.length > 0) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Вердикты экспертов</h2>
            <div className="space-y-4">
              {application.expert_verdicts.map((verdictItem: ExpertVerdict) => (
                <div
                  key={`${verdictItem.application_id}-${verdictItem.expert_id}`}
                  className={`p-4 rounded-lg ${
                    verdictItem.verdict === 'approved'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {verdictItem.expert?.surname} {verdictItem.expert?.name} {verdictItem.expert?.patronymic}
                        {user?.expert_id === verdictItem.expert_id && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                            Ваш вердикт
                          </span>
                        )}
                      </div>
                      <div className="text-sm mt-1">
                        <span className={verdictItem.verdict === 'approved' ? 'text-green-600' : 'text-red-600'}>
                          {verdictItem.verdict === 'approved' ? '✓ Одобрено' : '✗ Отклонено'}
                        </span>
                      </div>
                    </div>
                    {new Date(verdictItem.created_at || '').toLocaleDateString('ru-RU')}
                  </div>
                  {verdictItem.comment && (
                    <div className="text-sm text-gray-600 mt-2 p-3 bg-white rounded">
                      {verdictItem.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </UserPanelLayout>
  );
}

export default ExpertApplicationView;
