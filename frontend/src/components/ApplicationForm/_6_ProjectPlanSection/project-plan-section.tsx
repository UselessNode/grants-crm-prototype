import type { ProjectPlan } from '../../../types';
import { DateInput } from '../../ui/date-input';
import './ProjectPlanSection.css';

interface ProjectPlanSectionProps {
  project_plans: ProjectPlan[];
  errors: Record<string, string>;
  onChange: (index: number, field: keyof ProjectPlan, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

/**
 * Проверка корректности диапазона дат
 */
function isDateRangeValid(start: string, end: string): boolean {
  if (!start || !end) return true; // Пустые даты не валидируем здесь
  const startDate = new Date(start);
  const endDate = new Date(end);
  return startDate <= endDate;
}

export function ProjectPlanSection({
  project_plans,
  errors,
  onChange,
  onAdd,
  onRemove,
}: ProjectPlanSectionProps) {
  return (
    <div className="section-card ProjectPlanSection">
      <h2 className="section-title">
        6. План проекта
      </h2>
      {project_plans.map((plan, idx) => {
        const dateValid = isDateRangeValid(plan.start_date || '', plan.end_date || '');

        return (
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
                className={`field-input ${errors[`project_plan_${idx}_task`] ? 'field-input-error' : ''}`}
                placeholder="Название решаемой задачи"
              />
              {errors[`project_plan_${idx}_task`] && (
                <p className="field-error">{errors[`project_plan_${idx}_task`]}</p>
              )}
            </div>
            <div className="ProjectPlanSection__half-width">
              <label className="field-label">
                Мероприятие <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={plan.event_name}
                onChange={(e) => onChange(idx, 'event_name', e.target.value)}
                className={`field-input ${errors[`project_plan_${idx}_event_name`] ? 'field-input-error' : ''}`}
                placeholder="Название мероприятия"
              />
              {errors[`project_plan_${idx}_event_name`] && (
                <p className="field-error">{errors[`project_plan_${idx}_event_name`]}</p>
              )}
            </div>
            <div className="ProjectPlanSection__full-width">
              <label className="field-label">Описание мероприятия <span className="required-mark">*</span></label>
              <textarea
                value={plan.event_description || ''}
                onChange={(e) => onChange(idx, 'event_description', e.target.value)}
                rows={3}
                className={`field-input ${errors[`project_plan_${idx}_event_description`] ? 'field-input-error' : ''}`}
                placeholder="Подробное описание"
              />
              {errors[`project_plan_${idx}_event_description`] && (
                <p className="field-error">{errors[`project_plan_${idx}_event_description`]}</p>
              )}
            </div>
            <div className="ProjectPlanSection__half-width">
              <label className="field-label">Дата начала <span className="required-mark">*</span></label>
              <DateInput
                value={plan.start_date || ''}
                onChange={(newValue) => onChange(idx, 'start_date', newValue)}
                placeholder="ГГГГ-ММ-ДД"
              />
              {errors[`project_plan_${idx}_start_date`] && (
                <p className="field-error">{errors[`project_plan_${idx}_start_date`]}</p>
              )}
            </div>
            <div className="ProjectPlanSection__half-width">
              <label className="field-label">Дата окончания <span className="required-mark">*</span></label>
              <DateInput
                value={plan.end_date || ''}
                onChange={(newValue) => onChange(idx, 'end_date', newValue)}
                placeholder="ГГГГ-ММ-ДД"
              />
              {!dateValid && (
                <p className="field-error mt-1 text-xs">
                  Дата начала не может быть позже даты окончания
                </p>
              )}
              {errors[`project_plan_${idx}_end_date`] && (
                <p className="field-error">{errors[`project_plan_${idx}_end_date`]}</p>
              )}
            </div>
            <div className="ProjectPlanSection__full-width">
              <label className="field-label">Результат мероприятия <span className="required-mark">*</span></label>
              <input
                type="text"
                value={plan.results || ''}
                onChange={(e) => onChange(idx, 'results', e.target.value)}
                className={`field-input ${errors[`project_plan_${idx}_results`] ? 'field-input-error' : ''}`}
                placeholder="Ожидаемый результат"
              />
              {errors[`project_plan_${idx}_results`] && (
                <p className="field-error">{errors[`project_plan_${idx}_results`]}</p>
              )}
            </div>
            <div className="ProjectPlanSection__full-width">
              <label className="field-label">Форма фиксации <span className="required-mark">*</span></label>
              <input
                type="text"
                value={plan.fixation_form || ''}
                onChange={(e) => onChange(idx, 'fixation_form', e.target.value)}
                className={`field-input ${errors[`project_plan_${idx}_fixation_form`] ? 'field-input-error' : ''}`}
                placeholder="Отчёт, фото, видео..."
              />
              {errors[`project_plan_${idx}_fixation_form`] && (
                <p className="field-error">{errors[`project_plan_${idx}_fixation_form`]}</p>
              )}
            </div>
          </div>
          {!dateValid && (
            <div className="ProjectPlanSection__date-error mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              ⚠ Мероприятие #{idx + 1}: дата начала не может быть позже даты окончания
            </div>
          )}
        </div>
        );
      })}
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
