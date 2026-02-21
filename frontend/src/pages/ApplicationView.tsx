import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applicationService } from '../utils/applicationService';
import type { Application } from '../utils/types';

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
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;

    try {
      await applicationService.deleteApplication(parseInt(id!));
      navigate('/applications');
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Просмотр заявки</h1>
          <div className="flex gap-2">
            <Link
              to={`/applications/${application.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Редактировать
            </Link>
            <Link
              to="/applications"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Назад к списку
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Заголовок и статус */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{application.title}</h2>
              <p className="text-gray-500 mt-1">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Направление</h3>
              <p className="mt-1 text-gray-900">{application.direction_name || 'Не выбрано'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Дата подачи</h3>
              <p className="mt-1 text-gray-900">
                {application.submitted_at
                  ? new Date(application.submitted_at).toLocaleDateString('ru-RU')
                  : 'Не подана'}
              </p>
            </div>
          </div>

          {/* Описание проекта */}
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Описание идеи</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{application.idea_description}</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Важность для команды</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{application.importance_to_team}</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Цель проекта</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{application.project_goal}</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Задачи проекта</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{application.project_tasks}</p>
            </section>

            {application.implementation_experience && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Опыт реализации</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{application.implementation_experience}</p>
              </section>
            )}

            {application.results_description && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ожидаемые результаты</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{application.results_description}</p>
              </section>
            )}
          </div>

          {/* Кнопка удаления */}
          <div className="mt-8 pt-6 border-t">
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              🗑️ Удалить заявку
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
