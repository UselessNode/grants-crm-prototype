import type { Application } from "../../types";

interface ProjectDescriptionProps {
  application: Application;
}

// Определение полей описания проекта
const descriptionFields = [
  { key: "idea_description", label: "Идея проекта" },
  { key: "importance_to_team", label: "Важность для команды" },
  { key: "project_goal", label: "Цель проекта" },
  { key: "project_tasks", label: "Задачи проекта" },
  { key: "implementation_experience", label: "Опыт реализации" },
  { key: "results_description", label: "Ожидаемые результаты" },
] as const;

export function ProjectDescription({ application }: ProjectDescriptionProps) {
  // Проверяем есть ли хоть одно заполненное поле
  const hasAnyDescription = descriptionFields.some(
    (field) => application[field.key as keyof Application]
  );

  if (!hasAnyDescription) {
    return null;
  }

  return (
    <div className="application-section">
      <h3 className="application-section-title">Описание проекта</h3>
      <div className="space-y-1">
        {descriptionFields.map((field) => {
          const value = application[field.key as keyof Application];
          if (!value) return null;
          
          return (
            <div key={field.key} className="application-field">
              <div className="application-field-label">{field.label}</div>
              <div className="application-field-description">{value as string}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
