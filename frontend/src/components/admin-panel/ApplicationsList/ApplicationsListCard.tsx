import { Link } from 'react-router-dom';
import { Badge } from '../../ui/badge';
import type { Application, Status } from '../../../types';

// Расширяем тип Application, чтобы TypeScript знал о вложенных данных от Prisma
interface ApplicationWithReviews extends Application {
  application_reviews?: Array<{
    expert_id: number;
    review_status?: string | null;
    users?: {
      surname: string | null;
      name: string | null;
      patronymic: string | null;
    } | null;
  }>;
}

interface ApplicationsListCardProps {
  app: ApplicationWithReviews & {
    owner_email?: string;
    owner_name?: string;
    owner_id?: number | null;
  };
  statuses: Status[];
  selectedIds: number[];
  changingStatusId: number | null;
  onSelect: (id: number) => void;
  getStatusVariant: (statusName?: string) => any;
  onStatusChange: (applicationId: number, statusId: number) => Promise<void>;
}

export function ApplicationsListCard({
  app,
  statuses,
  selectedIds,
  changingStatusId,
  onSelect,
  getStatusVariant,
  onStatusChange,
}: ApplicationsListCardProps) {
  const reviews = [];

  return (
    <div className="ApplicationsList__card relative">
      {/* Чекбокс выбора */}
      <div className="ApplicationsList__cardSelect">
        <input
          type="checkbox"
          checked={selectedIds.includes(app.id!)}
          onChange={() => onSelect(app.id!)}
          disabled={changingStatusId === app.id} // Блокируем во время изменения статуса
        />
          </div>

      {/* Основная информация */}
      <div className="ApplicationsList__cardMain">
        <div className="ApplicationsList__cardHeader">
          <span className="ApplicationsList__cardId">#{app.id}</span>
          <Link
            to={`/applications/${app.id}`}
            className="ApplicationsList__cardTitle"
          >
            {app.title}
          </Link>
          <div className="ApplicationsList__cardMetaItem">
            <span className="ApplicationsList__cardMetaValue">
              <Badge
                mode="expandable"
                size="sm"
                variant={getStatusVariant(app.status_name)}
                options={statuses.map(s => ({ id: s.id, label: s.name, variant: getStatusVariant(s.name) }))}
                value={app.status_id ?? undefined}
                colorizeOptions
                onSelect={(option) => onStatusChange(app.id!, option.id as number)}
                disabled={changingStatusId === app.id} // Блокируем во время изменения статуса
              />
            </span>
          </div>
        </div>

        <div className="ApplicationsList__cardMeta">
          <div className="ApplicationsList__cardMetaItem">
            <span className="ApplicationsList__cardMetaLabel">Владелец:</span>
            <span className="ApplicationsList__cardMetaValue">{app.owner_name || app.owner_email || '—'}</span>
          </div>
          <div className="ApplicationsList__cardMetaItem">
            <span className="ApplicationsList__cardMetaLabel">Направление:</span>
            <span className="ApplicationsList__cardMetaValue">{app.direction_name || '—'}</span>
          </div>
          <div className="ApplicationsList__cardMetaItem">
            <span className="ApplicationsList__cardMetaLabel">Конкурс:</span>
            <span className="ApplicationsList__cardMetaValue">{app.tender_name || '—'}</span>
          </div>
          <div className="ApplicationsList__cardMetaItem">
            <span className="ApplicationsList__cardMetaLabel">Создано:</span>
            <span className="ApplicationsList__cardMetaValue">
              {app.created_at ? new Date(app.created_at).toLocaleDateString('ru-RU') : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Эксперты (теперь динамически из application_reviews) */}
      <div className="ApplicationsList__cardExperts">
        <div className="ApplicationsList__expertsLabel">Эксперты:</div>
        <div className="ApplicationsList__expertsList">
          {reviews.length > 0 ? (
            reviews.map((review) => {
              const expertName = review.users
                ? `${review.users.surname || ''} ${review.users.name || ''}`.trim() || `Эксперт #${review.expert_id}`
                : `Эксперт #${review.expert_id}`;

              return (
                <span
                  key={review.expert_id}
                  className="ExpertTag"
                  title={expertName}
                >
                  {expertName}
                </span>
              );
            })
          ) : (
            <span className="ExpertTag ExpertTag--empty" title="Не назначен">—</span>
          )}
        </div>
      </div>
    </div>
  );
}
