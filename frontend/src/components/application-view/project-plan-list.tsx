// frontend/src/components/application-view/project-plan-list.tsx
import type { ProjectPlan } from "../../types";
import { formatDate } from "../../utils/application-helpers";

interface ProjectPlanListProps {
  plans: ProjectPlan[];
}

export function ProjectPlanList({ plans }: ProjectPlanListProps) {
  if (!plans || plans.length === 0) return null;

  return (
    <div className="application-section">
      <h3 className="application-section-title">План реализации</h3>
      <div className="space-y-1">
        {plans.map((plan, index) => {
          const title = plan.task || plan.event_name || "Без названия";
          const hasDates = plan.start_date || plan.end_date;
          const hasDetails = plan.event_description || plan.results || plan.fixation_form;

          return (
            <div key={plan.id || index} className="plan-item">
              <div className="plan-item-header">
                <div className="plan-item-title">
                  {index + 1}. {title}
                </div>
                {hasDates && (
                  <div className="plan-item-dates">
                    {formatDate(plan.start_date)} — {formatDate(plan.end_date)}
                  </div>
                )}
              </div>
              {hasDetails && (
                <div className="plan-item-details">
                  {plan.event_description && <div>{plan.event_description}</div>}
                  {plan.results && <div>Результаты: {plan.results}</div>}
                  {plan.fixation_form && <div>Форма фиксации: {plan.fixation_form}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
