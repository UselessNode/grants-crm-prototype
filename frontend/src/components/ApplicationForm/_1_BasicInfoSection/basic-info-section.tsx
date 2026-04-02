import type { Direction, Tender } from '../../../types';
import './BasicInfoSection.css';

interface BasicInfoSectionProps {
  title: string;
  tender_id: string;
  direction_id: string;
  directions: Direction[];
  tenders: Tender[];
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function BasicInfoSection({
  title,
  tender_id,
  direction_id,
  directions,
  tenders,
  errors,
  onChange,
}: BasicInfoSectionProps) {
  return (
    <div className="section-card BasicInfoSection">
      <h2 className="section-title">
        1. Основная информация
      </h2>
      <div className="BasicInfoSection__grid">
        <div className="BasicInfoSection__full-width">
          <label className="field-label-lg">
            Название проекта <span className="required-mark">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={onChange}
            className={`field-input-lg ${
              errors.title ? 'field-input-error' : ''
            }`}
            placeholder="Введите название проекта"
          />
          {errors.title && <p className="field-error-lg">{errors.title}</p>}
        </div>

        <div>
          <label className="field-label-lg">
            Конкурс <span className="required-mark">*</span>
          </label>
          <select
            name="tender_id"
            value={tender_id}
            onChange={onChange}
            className="field-input-lg"
          >
            <option value="">Не выбран</option>
            {tenders.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label-lg">
            Направление <span className="required-mark">*</span>
          </label>
          <select
            name="direction_id"
            value={direction_id}
            onChange={onChange}
            className={`field-input-lg ${
              errors.direction_id ? 'field-input-error' : ''
            }`}
          >
            <option value="">Не выбрано</option>
            {directions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
