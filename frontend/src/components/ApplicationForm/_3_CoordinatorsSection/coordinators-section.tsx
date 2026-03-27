import type { ProjectCoordinator } from '../../../types';
import './CoordinatorsSection.css';

interface CoordinatorsSectionProps {
  coordinators: ProjectCoordinator[];
  implementation_experience: string;
  errors: Record<string, string>;
  onChange: (index: number, field: keyof ProjectCoordinator, value: string) => void;
  onExperienceChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function CoordinatorsSection({
  coordinators,
  implementation_experience,
  errors,
  onChange,
  onExperienceChange,
  onAdd,
  onRemove,
}: CoordinatorsSectionProps) {
  const coordData = coordinators.length > 0 ? coordinators[0] : null;

  if (!coordData) {
    return (
      <div className="section-card">
        <h2 className="section-title">
          3. Координатор проекта
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Добавьте информацию о координаторе проекта.
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="btn-add"
        >
          + Добавить координатора
        </button>
      </div>
    );
  }

  return (
    <div className="section-card">
      <h2 className="section-title">
        3. Координатор проекта
      </h2>
      <div className="section-card-item">
        <div className="flex justify-between items-center mb-3">
          <span className="item-label">Координатор</span>
          {coordinators.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(0)}
              className="btn-remove"
            >
              Удалить
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Фамилия *</label>
            <input
              type="text"
              value={coordData.surname}
              onChange={(e) => onChange(0, 'surname', e.target.value)}
              className={`field-input ${errors['coordinator_surname'] ? 'field-input-error' : ''}`}
              placeholder="Иванов"
            />
            {errors['coordinator_surname'] && <p className="field-error">{errors['coordinator_surname']}</p>}
          </div>
          <div>
            <label className="field-label">Имя *</label>
            <input
              type="text"
              value={coordData.name}
              onChange={(e) => onChange(0, 'name', e.target.value)}
              className={`field-input ${errors['coordinator_name'] ? 'field-input-error' : ''}`}
              placeholder="Иван"
            />
            {errors['coordinator_name'] && <p className="field-error">{errors['coordinator_name']}</p>}
          </div>
          <div>
            <label className="field-label">Отчество</label>
            <input
              type="text"
              value={coordData.patronymic || ''}
              onChange={(e) => onChange(0, 'patronymic', e.target.value)}
              className="field-input"
              placeholder="Иванович"
            />
          </div>
          <div>
            <label className="field-label">Отношение к команде</label>
            <input
              type="text"
              value={coordData.relation_to_team || ''}
              onChange={(e) => onChange(0, 'relation_to_team', e.target.value)}
              className="field-input"
              placeholder="Руководитель, наставник..."
            />
          </div>
          <div>
            <label className="field-label">Контактные данные</label>
            <input
              type="text"
              value={coordData.contact_info || ''}
              onChange={(e) => onChange(0, 'contact_info', e.target.value)}
              className="field-input"
              placeholder="Телефон, email"
            />
          </div>
          <div>
            <label className="field-label">Соц. сети</label>
            <input
              type="text"
              value={coordData.social_media_links || ''}
              onChange={(e) => onChange(0, 'social_media_links', e.target.value)}
              className="field-input"
              placeholder="VK, Telegram..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">Образование</label>
            <input
              type="text"
              value={coordData.education || ''}
              onChange={(e) => onChange(0, 'education', e.target.value)}
              className="field-input"
              placeholder="ВУЗ, специальность"
            />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">Опыт работы</label>
            <textarea
              value={coordData.work_experience || ''}
              onChange={(e) => onChange(0, 'work_experience', e.target.value)}
              className="field-input-lg"
              placeholder="Описание опыта работы"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Описание опыта работы команды */}
      <div className="mt-6">
        <label className="field-label-lg">Описание опыта работы команды *</label>
        <textarea
          name="implementation_experience"
          value={implementation_experience}
          onChange={onExperienceChange}
          className="field-input-lg"
          placeholder="Расскажите о предыдущих проектах команды..."
          rows={4}
        />
        {errors['implementation_experience'] && (
          <p className="field-error-lg">{errors['implementation_experience']}</p>
        )}
      </div>

      {coordinators.length === 0 && (
        <button
          type="button"
          onClick={onAdd}
          className="btn-add mt-4"
        >
          + Добавить координатора
        </button>
      )}
    </div>
  );
}
