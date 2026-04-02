// DobroResponsibleSection.tsx
import type { DobroResponsible } from '../../../types';
import './DobroResponsibleSection.css';

interface DobroResponsibleSectionProps {
  dobro_responsible: DobroResponsible[];
  errors: Record<string, string>;
  onChange: (index: number, field: keyof DobroResponsible, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function DobroResponsibleSection({
  dobro_responsible,
  errors,
  onChange,
  onAdd,
  onRemove,
}: DobroResponsibleSectionProps) {
  const dobroData = dobro_responsible.length > 0 ? dobro_responsible[0] : null;

  if (!dobroData) {
    return (
      <div className="section-card DobroResponsibleSection">
        <h2 className="section-title">
          4. Ответственный по работе с порталом "DOBRO.RU"
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Добавьте информацию об ответственном за работу с порталом DOBRO.RU.
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="btn-add"
        >
          + Добавить ответственного
        </button>
      </div>
    );
  }

  return (
    <div className="section-card DobroResponsibleSection">
      <h2 className="section-title">
        4. Ответственный по работе с порталом "DOBRO.RU"
      </h2>
      <div className="section-card-item">
        <div className="flex justify-between items-center mb-3">
          <span className="item-label">Ответственный</span>
          {dobro_responsible.length > 1 && (
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
              value={dobroData.surname}
              onChange={(e) => onChange(0, 'surname', e.target.value)}
              className={`field-input ${errors['dobro_surname'] ? 'field-input-error' : ''}`}
              placeholder="Иванов"
            />
            {errors['dobro_surname'] && <p className="field-error">{errors['dobro_surname']}</p>}
          </div>
          <div>
            <label className="field-label">Имя *</label>
            <input
              type="text"
              value={dobroData.name}
              onChange={(e) => onChange(0, 'name', e.target.value)}
              className={`field-input ${errors['dobro_name'] ? 'field-input-error' : ''}`}
              placeholder="Иван"
            />
            {errors['dobro_name'] && <p className="field-error">{errors['dobro_name']}</p>}
          </div>
          <div>
            <label className="field-label">Отчество</label>
            <input
              type="text"
              value={dobroData.patronymic || ''}
              onChange={(e) => onChange(0, 'patronymic', e.target.value)}
              className="field-input"
              placeholder="Иванович"
            />
          </div>
          <div>
            <label className="field-label">Отношение к команде</label>
            <input
              type="text"
              value={dobroData.relation_to_team || ''}
              onChange={(e) => onChange(0, 'relation_to_team', e.target.value)}
              className="field-input"
              placeholder="Руководитель, координатор..."
            />
          </div>
          <div>
            <label className="field-label">Контактные данные</label>
            <input
              type="text"
              value={dobroData.contact_info || ''}
              onChange={(e) => onChange(0, 'contact_info', e.target.value)}
              className="field-input"
              placeholder="Телефон, email"
            />
          </div>
          <div>
            <label className="field-label">Соц. сети</label>
            <input
              type="text"
              value={dobroData.social_media_links || ''}
              onChange={(e) => onChange(0, 'social_media_links', e.target.value)}
              className="field-input"
              placeholder="VK, Telegram..."
            />
          </div>
          <div>
            <label className="field-label">Ссылка на DOBRO.RU</label>
            <input
              type="url"
              value={dobroData.dobro_link || ''}
              onChange={(e) => onChange(0, 'dobro_link', e.target.value)}
              className={`field-input ${errors['dobro_dobro_link'] ? 'field-input-error' : ''}`}
              placeholder="https://dobro.ru/user/123456"
            />
            {errors['dobro_dobro_link'] && <p className="field-error">{errors['dobro_dobro_link']}</p>}
          </div>
        </div>
      </div>

      {dobro_responsible.length === 0 && (
        <button
          type="button"
          onClick={onAdd}
          className="btn-add mt-4"
        >
          + Добавить ответственного
        </button>
      )}
    </div>
  );
}
