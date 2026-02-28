interface ProjectResultsSectionProps {
  results_description: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ProjectResultsSection({
  results_description,
  onChange,
}: ProjectResultsSectionProps) {
  return (
    <div className="section-card">
      <h2 className="section-title">
        7. Результаты проекта
      </h2>
      <div>
        <label className="field-label-lg">
          Что изменилось по итогу проекта
        </label>
        <textarea
          name="results_description"
          value={results_description}
          onChange={onChange}
          rows={5}
          className="field-input-lg"
          placeholder="Опишите ожидаемые результаты"
        />
      </div>
    </div>
  );
}
