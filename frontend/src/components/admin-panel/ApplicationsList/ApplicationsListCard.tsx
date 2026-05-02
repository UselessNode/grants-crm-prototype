import { Link } from 'react-router-dom';
import { Badge } from '../../ui/badge';
import type { Application, Expert, Status } from '../../../types';

interface ApplicationsListCardProps {
  app: Application & { owner_email?: string; owner_name?: string; owner_id?: number | null };
  experts: Expert[];
  statuses: Status[];
  selectedIds: number[];
  changingStatusId: number | null;
  onSelect: (id: number) => void;
  getStatusVariant: (statusName?: string) => any;
  onStatusChange: (applicationId: number, statusId: number) => Promise<void>;
}

export function ApplicationsListCard({
  app,
  experts,
  statuses,
  selectedIds,
  changingStatusId,
  onSelect,
  getStatusVariant,
  onStatusChange,
}: ApplicationsListCardProps) {
  const findExpert = (id: number | null | undefined) => {
    if (!id) return null;
    return experts.find(e => e.id === id);
  };

  const expert1 = findExpert(app.expert_1);
  const expert2 = findExpert(app.expert_2);

  return (
    <div className="ApplicationsList__card relative">
      {/* Чекбокс выбора */}
      <div className="ApplicationsList__cardSelect">
        <input
          type="checkbox"
          checked={selectedIds.includes(app.id!)}
          onChange={() => onSelect(app.id!)}
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

      {/* Эксперты */}
      <div className="ApplicationsList__cardExperts">
        <div className="ApplicationsList__expertsLabel">Эксперты:</div>
        <div className="ApplicationsList__expertsList">
          <span
            className={`ExpertTag ${!expert1 ? 'ExpertTag--empty' : ''}`}
            title={expert1 ? `${expert1.surname} ${expert1.name}` : 'Не назначен'}
          >
            {expert1 ? `${expert1.surname} ${expert1.name}` : '—'}
          </span>
          <span
            className={`ExpertTag ${!expert2 ? 'ExpertTag--empty' : ''}`}
            title={expert2 ? `${expert2.surname} ${expert2.name}` : 'Не назначен'}
          >
            {expert2 ? `${expert2.surname} ${expert2.name}` : '—'}
          </span>
        </div>
      </div>

      {/* Действия */}
      <div className="ApplicationsList__cardActions">
        {/* OBSOLETE */}
      </div>
    </div>
  );
}
