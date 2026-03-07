// ApplicationView
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applicationService } from '../utils/applicationService';
import type { Application } from '../utils/types';
import UserHeader from '../components/UserHeader';

export default function ApplicationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplication = async () => {
      try {
        const data = await applicationService.getApplication(parseInt(id!));
        setApplication(data.data);
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
    <div className="application-view-page bg-gray-50">
      <UserHeader />

      <main className="page-main">
        {/* Заголовок с кнопками */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Просмотр заявки</h2>
          <div className="flex gap-2">
            {canEdit(application.status_name) ? (
              <Link to={`/applications/${application.id}/edit`} className="btn-header">
                Редактировать
              </Link>
            ) : (
              <span className="px-4 py-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed" title="Редактирование доступно только для черновиков и отклонённых заявок">
                Редактировать
              </span>
            )}
            {canSubmit(application.status_name) ? (
              <button onClick={handleSubmit} className="btn-primary">
                Подать
              </button>
            ) : (
              <span className="px-4 py-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed" title="Подать заявку можно только из статуса «Черновик»">
                Подать
              </span>
            )}
            <Link to="/applications" className="btn-cancel">
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
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(application.status_name)}`}>
              {application.status_name || '—'}
            </span>
          </div>

          {/* Основная информация */}
          <div className="application-data-grid">
            <div>
              <h3 className="application-data-label">Направление</h3>
              <p className="application-data-value">{application.direction_name || 'Не выбрано'}</p>
            </div>
            <div>
              <h3 className="application-data-label">Дата подачи</h3>
              <p className="application-data-value">
                {application.submitted_at
                  ? new Date(application.submitted_at).toLocaleDateString('ru-RU')
                  : 'Не подана'}
              </p>
            </div>
          </div>

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
              <button onClick={handleDelete} className="application-delete-button">
                Удалить заявку
              </button>
            ) : (
              <span className="text-gray-400 cursor-not-allowed" title="Удаление доступно только для черновиков и отклонённых заявок">
                Удалить заявку
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
