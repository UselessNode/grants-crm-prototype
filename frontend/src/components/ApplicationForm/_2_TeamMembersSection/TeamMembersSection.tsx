import type { TeamMember } from '../../../utils/types';
import './TeamMembersSection.css';

interface TeamMembersSectionProps {
  team_members: TeamMember[];
  errors: Record<string, string>;
  onChange: (index: number, field: keyof TeamMember, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function TeamMembersSection({
  team_members,
  errors,
  onChange,
  onAdd,
  onRemove,
}: TeamMembersSectionProps) {
  return (
    <div className="section-card TeamMembersSection">
      <h2 className="section-title">
        2. Состав команды проекта
      </h2>
      {team_members.map((member, idx) => (
        <div key={idx} className="TeamMembersSection__item">
          <div className="TeamMembersSection__item-header">
            <span className="item-label">Участник #{idx + 1}</span>
            {team_members.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="btn-remove"
              >
                Удалить
              </button>
            )}
          </div>
          <div className="TeamMembersSection__grid">
            <div>
              <label className="field-label">
                Фамилия <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={member.surname}
                onChange={(e) => onChange(idx, 'surname', e.target.value)}
                className={`field-input ${errors[`team_member_${idx}`] ? 'field-input-error' : ''}`}
                placeholder="Иванов"
              />
              {errors[`team_member_${idx}`] && <p className="field-error">{errors[`team_member_${idx}`]}</p>}
            </div>
            <div>
              <label className="field-label">
                Имя <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={member.name}
                onChange={(e) => onChange(idx, 'name', e.target.value)}
                className={`field-input ${errors[`team_member_${idx}_name`] ? 'field-input-error' : ''}`}
                placeholder="Иван"
              />
            </div>
            <div>
              <label className="field-label">Отчество</label>
              <input
                type="text"
                value={member.patronymic || ''}
                onChange={(e) => onChange(idx, 'patronymic', e.target.value)}
                className="field-input"
                placeholder="Иванович"
              />
            </div>
          </div>
          <div className="TeamMembersSection__grid TeamMembersSection__mt">
            <div>
              <label className="field-label">Задачи в проекте</label>
              <input
                type="text"
                value={member.tasks_in_project || ''}
                onChange={(e) => onChange(idx, 'tasks_in_project', e.target.value)}
                className="field-input"
                placeholder="Разработчик, дизайнер..."
              />
            </div>
            <div>
              <label className="field-label">Контактные данные</label>
              <input
                type="text"
                value={member.contact_info || ''}
                onChange={(e) => onChange(idx, 'contact_info', e.target.value)}
                className="field-input"
                placeholder="Телефон, email"
              />
            </div>
            <div>
              <label className="field-label">Соц. сети</label>
              <input
                type="text"
                value={member.social_media_links || ''}
                onChange={(e) => onChange(idx, 'social_media_links', e.target.value)}
                className="field-input"
                placeholder="VK, Telegram..."
              />
            </div>
            {/*Тут добавить пункт для загрузки согласия об обработке персональных данных*/}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="btn-add"
      >
        + Добавить участника
      </button>
    </div>
  );
}
