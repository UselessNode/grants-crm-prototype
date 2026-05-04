interface ProjectResultsSectionProps {
  results_description: string;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ProjectResultsSection({
  results_description,
  errors,
  onChange,
}: ProjectResultsSectionProps) {
  return (
    <div className="section-card">
      <h2 className="section-title">
        7. Результаты проекта
      </h2>
      <div>
        <label className="field-label-lg">
          Что изменилось по итогу проекта <span className="required-mark">*</span>
        </label>
        <textarea
          name="results_description"
          id="results_description"
          value={results_description}
          onChange={onChange}
          rows={5}
          className={`field-input-lg ${errors['results_description'] ? 'field-input-error' : ''}`}
          placeholder="Опишите ожидаемые результаты"
          data-error="results_description"
        />
        {errors['results_description'] && (
          <p className="field-error-lg">{errors['results_description']}</p>
        )}
      </div>
    </div>
  );
}
