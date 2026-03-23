import type { ProjectPlan } from '../../../utils/types';
import { DateInput } from '../../ui/DateInput';
import './ProjectPlanSection.css';

interface ProjectPlanSectionProps {
  project_plans: ProjectPlan[];
  onChange: (index: number, field: keyof ProjectPlan, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function ProjectPlanSection({
  project_plans,
  onChange,
  onAdd,
  onRemove,
}: ProjectPlanSectionProps) {
  return (
    <div className="section-card ProjectPlanSection">
      <h2 className="section-title">
        6. План проекта
      </h2>
      {project_plans.map((plan, idx) => (
        <div key={idx} className="ProjectPlanSection__item">
          <div className="ProjectPlanSection__item-header">
            <span className="item-label">Мероприятие #{idx + 1}</span>
            {project_plans.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="btn-remove"
              >
                Удалить
              </button>
            )}
          </div>
          <div className="ProjectPlanSection__grid">
            <div className="ProjectPlanSection__half-width">
              <label className="field-label">
                Задача <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={plan.task}
                onChange={(e) => onChange(idx, 'task', e.target.value)}
                className="field-input"
                placeholder="Название решаемой задачи"
              />
            </div>
            <div className="ProjectPlanSection__half-width">
              <label className="field-label">
                Мероприятие <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={plan.event_name}
                onChange={(e) => onChange(idx, 'event_name', e.target.value)}
                className="field-input"
                placeholder="Название мероприятия"
              />
            </div>
            <div className="ProjectPlanSection__full-width">
              <label className="field-label">Описание мероприятия</label>
              <textarea
                value={plan.event_description || ''}
                onChange={(e) => onChange(idx, 'event_description', e.target.value)}
                rows={3}
                className="field-input"
                placeholder="Подробное описание"
              />
            </div>
            <div className="ProjectPlanSection__half-width">
              <label className="field-label">Дата начала</label>
              <DateInput
                value={plan.start_date || ''}
                onChange={(newValue) => onChange(idx, 'start_date', newValue)}
                placeholder="ГГГГ-ММ-ДД"
              />
            </div>
            <div className="ProjectPlanSection__half-width">
              <label className="field-label">Дата окончания</label>
              <DateInput
                value={plan.end_date || ''}
                onChange={(newValue) => onChange(idx, 'end_date', newValue)}
                placeholder="ГГГГ-ММ-ДД"
              />
            </div>
            <div className="ProjectPlanSection__full-width">
              <label className="field-label">Результат мероприятия</label>
              <input
                type="text"
                value={plan.results || ''}
                onChange={(e) => onChange(idx, 'results', e.target.value)}
                className="field-input"
                placeholder="Ожидаемый результат"
              />
            </div>
            <div className="ProjectPlanSection__full-width">
              <label className="field-label">Форма фиксации</label>
              <input
                type="text"
                value={plan.fixation_form || ''}
                onChange={(e) => onChange(idx, 'fixation_form', e.target.value)}
                className="field-input"
                placeholder="Отчёт, фото, видео..."
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="btn-add"
      >
        + Добавить мероприятие
      </button>
    </div>
  );
}
