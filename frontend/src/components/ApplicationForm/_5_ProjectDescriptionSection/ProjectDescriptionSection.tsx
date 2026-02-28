// ProjectDescriptionSection.tsx
import './ProjectDescriptionSection.css';

interface ProjectDescriptionSectionProps {
  idea_description: string;
  importance_to_team: string;
  project_goal: string;
  project_tasks: string;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ProjectDescriptionSection({
  idea_description,
  importance_to_team,
  project_goal,
  project_tasks,
  errors,
  onChange,
}: ProjectDescriptionSectionProps) {
  return (
    <div className="section-card ProjectDescriptionSection">
      <h2 className="section-title">
        5. Описание проекта
      </h2>
      <div className="ProjectDescriptionSection__space-y">
        <div>
          <label className="field-label-lg">
            5.1 Идея проекта и почему она должна быть реализована <span className="required-mark">*</span>
          </label>
          <textarea
            name="idea_description"
            value={idea_description}
            onChange={onChange}
            rows={5}
            className={`field-input-lg ${
              errors.idea_description ? 'field-input-error' : ''
            }`}
            placeholder="Опишите вашу идею"
          />
          {errors.idea_description && <p className="field-error-lg">{errors.idea_description}</p>}
        </div>

        <div>
          <label className="field-label-lg">
            5.2 Почему вашей команде этот проект важен <span className="required-mark">*</span>
          </label>
          <textarea
            name="importance_to_team"
            value={importance_to_team}
            onChange={onChange}
            rows={4}
            className={`field-input-lg ${
              errors.importance_to_team ? 'field-input-error' : ''
            }`}
            placeholder="Почему это важно для вашей команды"
          />
          {errors.importance_to_team && <p className="field-error-lg">{errors.importance_to_team}</p>}
        </div>

        <div>
          <label className="field-label-lg">
            5.3 Цель проекта <span className="required-mark">*</span>
          </label>
          <textarea
            name="project_goal"
            value={project_goal}
            onChange={onChange}
            rows={4}
            className={`field-input-lg ${
              errors.project_goal ? 'field-input-error' : ''
            }`}
            placeholder="Какую цель вы хотите достичь"
          />
          {errors.project_goal && <p className="field-error-lg">{errors.project_goal}</p>}
        </div>

        <div>
          <label className="field-label-lg">
            5.4 Задачи проекта <span className="required-mark">*</span>
          </label>
          <textarea
            name="project_tasks"
            value={project_tasks}
            onChange={onChange}
            rows={5}
            className={`field-input-lg ${
              errors.project_tasks ? 'field-input-error' : ''
            }`}
            placeholder="Перечислите основные задачи"
          />
          {errors.project_tasks && <p className="field-error-lg">{errors.project_tasks}</p>}
        </div>
      </div>
    </div>
  );
}
