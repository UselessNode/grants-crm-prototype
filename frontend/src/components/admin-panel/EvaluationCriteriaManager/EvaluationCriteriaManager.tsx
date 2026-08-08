import { useState, useEffect } from 'react';
import { evaluationCriteriaService, EvaluationCriteria } from '../../../services/evaluationCriteriaService';
import { adminService } from '../../../services/adminService';
import Icon from '../../common/icon';
import './EvaluationCriteriaManager.css';

interface EvaluationCriteriaManagerProps {
  tenderId: number;
  onClose: () => void;
  onCriteriaUpdated?: () => void;
}

export function EvaluationCriteriaManager({ 
  tenderId, 
  onClose, 
  onCriteriaUpdated 
}: EvaluationCriteriaManagerProps) {
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [tenders, setTenders] = useState<{ id: number; name: string }[]>([]);
  const [selectedTender, setSelectedTender] = useState<number>(tenderId);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Форма для нового критерия
  const [newCriteria, setNewCriteria] = useState({
    name: '',
    description: '',
    min_value: 0,
    max_value: 10,
    weight: 1,
  });

  // Форма для редактирования критерия
  const [editingCriteria, setEditingCriteria] = useState<EvaluationCriteria | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [tendersData, criteriaData] = await Promise.all([
          adminService.getTenders(),
          evaluationCriteriaService.getByTender(tenderId),
        ]);
        setTenders(tendersData.data);
        setCriteria(criteriaData);
      } catch (err) {
        setError('Ошибка загрузки данных');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tenderId]);

  useEffect(() => {
    if (selectedTender) {
      const loadCriteria = async () => {
        setLoading(true);
        try {
          const criteriaData = await evaluationCriteriaService.getByTender(selectedTender);
          setCriteria(criteriaData);
        } catch (err) {
          setError('Ошибка загрузки критериев');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadCriteria();
    }
  }, [selectedTender]);

  const handleTenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTender(Number(e.target.value));
  };

  const handleNewCriteriaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setNewCriteria(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCreateCriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const created = await evaluationCriteriaService.create({
        tender_id: selectedTender,
        name: newCriteria.name,
        description: newCriteria.description || null,
        min_value: newCriteria.min_value,
        max_value: newCriteria.max_value,
        weight: newCriteria.weight,
      });

      setCriteria([...criteria, created]);
      setNewCriteria({
        name: '',
        description: '',
        min_value: 0,
        max_value: 10,
        weight: 1,
      });
      onCriteriaUpdated?.();
    } catch (err) {
      setError('Ошибка при создании критерия');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCriteria) return;

    setSaving(true);
    setError(null);

    try {
      const updated = await evaluationCriteriaService.update(editingCriteria.id, {
        name: editingCriteria.name,
        description: editingCriteria.description || null,
        min_value: editingCriteria.min_value,
        max_value: editingCriteria.max_value,
        weight: editingCriteria.weight,
      });

      setCriteria(criteria.map(c => c.id === updated.id ? updated : c));
      setEditingCriteria(null);
      onCriteriaUpdated?.();
    } catch (err) {
      setError('Ошибка при обновлении критерия');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCriteria = async (id: number) => {
    if (!window.confirm('Удалить этот критерий?')) return;

    setSaving(true);
    setError(null);

    try {
      await evaluationCriteriaService.delete(id);
      setCriteria(criteria.filter(c => c.id !== id));
      onCriteriaUpdated?.();
    } catch (err) {
      setError('Ошибка при удалении критерия');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDefaultCriteria = async () => {
    if (!window.confirm('Создать стандартный набор критериев? Это удалит существующие критерии для этого тендера.')) return;

    setSaving(true);
    setError(null);

    try {
      await evaluationCriteriaService.createDefault(selectedTender);
      const criteriaData = await evaluationCriteriaService.getByTender(selectedTender);
      setCriteria(criteriaData);
      onCriteriaUpdated?.();
    } catch (err) {
      setError('Ошибка при создании стандартных критериев');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (criteriaItem: EvaluationCriteria) => {
    setEditingCriteria({ ...criteriaItem });
  };

  const cancelEditing = () => {
    setEditingCriteria(null);
  };

  if (loading) {
    return (
      <div className="EvaluationCriteriaManager">
        <div className="EvaluationCriteriaManager__overlay" onClick={onClose} />
        <div className="EvaluationCriteriaManager__content">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="EvaluationCriteriaManager">
      <div className="EvaluationCriteriaManager__overlay" onClick={onClose} />
      <div className="EvaluationCriteriaManager__content">
        <div className="EvaluationCriteriaManager__header">
          <h2 className="EvaluationCriteriaManager__title">Управление критериями оценки</h2>
          <button
            type="button"
            onClick={onClose}
            className="EvaluationCriteriaManager__close"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        {error && (
          <div className="EvaluationCriteriaManager__error">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="EvaluationCriteriaManager__error-close"
            >
              ×
            </button>
          </div>
        )}

        <div className="EvaluationCriteriaManager__body">
          {/* Выбор тендера */}
          <div className="EvaluationCriteriaManager__tender-select">
            <label className="EvaluationCriteriaManager__label">
              Конкурс (Тендер):
            </label>
            <select
              value={selectedTender}
              onChange={handleTenderChange}
              className="EvaluationCriteriaManager__select"
            >
              {tenders.map(tender => (
                <option key={tender.id} value={tender.id}>
                  {tender.name}
                </option>
              ))}
            </select>
          </div>

          {/* Кнопка создания стандартных критериев */}
          <button
            type="button"
            onClick={handleCreateDefaultCriteria}
            className="btn-secondary EvaluationCriteriaManager__default-btn"
            disabled={saving}
          >
            Создать стандартные критерии
          </button>

          {/* Форма создания нового критерия */}
          <form onSubmit={handleCreateCriteria} className="EvaluationCriteriaManager__form">
            <h3 className="EvaluationCriteriaManager__section-title">Добавить новый критерий</h3>
            
            <div className="EvaluationCriteriaManager__grid">
              <div className="EvaluationCriteriaManager__field">
                <label className="EvaluationCriteriaManager__label">
                  Название *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newCriteria.name}
                  onChange={handleNewCriteriaChange}
                  className="EvaluationCriteriaManager__input"
                  placeholder="Крутость"
                  required
                />
              </div>

              <div className="EvaluationCriteriaManager__field">
                <label className="EvaluationCriteriaManager__label">
                  Минимальное значение
                </label>
                <input
                  type="number"
                  name="min_value"
                  value={newCriteria.min_value}
                  onChange={handleNewCriteriaChange}
                  className="EvaluationCriteriaManager__input"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="EvaluationCriteriaManager__field">
                <label className="EvaluationCriteriaManager__label">
                  Максимальное значение
                </label>
                <input
                  type="number"
                  name="max_value"
                  value={newCriteria.max_value}
                  onChange={handleNewCriteriaChange}
                  className="EvaluationCriteriaManager__input"
                  placeholder="10"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="EvaluationCriteriaManager__field">
                <label className="EvaluationCriteriaManager__label">
                  Вес
                </label>
                <input
                  type="number"
                  name="weight"
                  value={newCriteria.weight}
                  onChange={handleNewCriteriaChange}
                  className="EvaluationCriteriaManager__input"
                  placeholder="1"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="EvaluationCriteriaManager__field EvaluationCriteriaManager__field--full">
                <label className="EvaluationCriteriaManager__label">
                  Описание
                </label>
                <textarea
                  name="description"
                  value={newCriteria.description}
                  onChange={handleNewCriteriaChange}
                  className="EvaluationCriteriaManager__textarea"
                  placeholder="Описание критерия"
                  rows={2}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={saving || !newCriteria.name}
            >
              {saving ? 'Сохранение...' : 'Добавить критерий'}
            </button>
          </form>

          {/* Форма редактирования критерия */}
          {editingCriteria && (
            <form onSubmit={handleUpdateCriteria} className="EvaluationCriteriaManager__form EvaluationCriteriaManager__form--edit">
              <h3 className="EvaluationCriteriaManager__section-title">Редактировать критерий</h3>
              
              <div className="EvaluationCriteriaManager__grid">
                <div className="EvaluationCriteriaManager__field">
                  <label className="EvaluationCriteriaManager__label">
                    Название *
                  </label>
                  <input
                    type="text"
                    value={editingCriteria.name}
                    onChange={(e) => setEditingCriteria({ ...editingCriteria, name: e.target.value })}
                    className="EvaluationCriteriaManager__input"
                    required
                  />
                </div>

                <div className="EvaluationCriteriaManager__field">
                  <label className="EvaluationCriteriaManager__label">
                    Минимальное значение
                  </label>
                  <input
                    type="number"
                    value={editingCriteria.min_value}
                    onChange={(e) => setEditingCriteria({ ...editingCriteria, min_value: Number(e.target.value) })}
                    className="EvaluationCriteriaManager__input"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="EvaluationCriteriaManager__field">
                  <label className="EvaluationCriteriaManager__label">
                    Максимальное значение
                  </label>
                  <input
                    type="number"
                    value={editingCriteria.max_value}
                    onChange={(e) => setEditingCriteria({ ...editingCriteria, max_value: Number(e.target.value) })}
                    className="EvaluationCriteriaManager__input"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="EvaluationCriteriaManager__field">
                  <label className="EvaluationCriteriaManager__label">
                    Вес
                  </label>
                  <input
                    type="number"
                    value={editingCriteria.weight}
                    onChange={(e) => setEditingCriteria({ ...editingCriteria, weight: Number(e.target.value) })}
                    className="EvaluationCriteriaManager__input"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="EvaluationCriteriaManager__field EvaluationCriteriaManager__field--full">
                  <label className="EvaluationCriteriaManager__label">
                    Описание
                  </label>
                  <textarea
                    value={editingCriteria.description || ''}
                    onChange={(e) => setEditingCriteria({ ...editingCriteria, description: e.target.value })}
                    className="EvaluationCriteriaManager__textarea"
                    placeholder="Описание критерия"
                    rows={2}
                  />
                </div>
              </div>

              <div className="EvaluationCriteriaManager__form-actions">
                <button type="button" onClick={cancelEditing} className="btn-cancel">
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving || !editingCriteria.name}
                >
                  {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </div>
            </form>
          )}

          {/* Список критериев */}
          <div className="EvaluationCriteriaManager__list">
            <h3 className="EvaluationCriteriaManager__section-title">
              Существующие критерии ({criteria.length})
            </h3>

            {criteria.length === 0 ? (
              <p className="EvaluationCriteriaManager__empty">
                Нет критериев. Создайте новый критерий или используйте стандартный набор.
              </p>
            ) : (
              <table className="EvaluationCriteriaManager__table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Описание</th>
                    <th>Диапазон</th>
                    <th>Вес</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((criterion) => (
                    <tr key={criterion.id}>
                      <td>{criterion.name}</td>
                      <td>{criterion.description || '-'}</td>
                      <td>{criterion.min_value} - {criterion.max_value}</td>
                      <td>{criterion.weight}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => startEditing(criterion)}
                          className="btn-icon"
                          title="Редактировать"
                        >
                          <Icon name="edit" size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCriteria(criterion.id)}
                          className="btn-icon btn-icon--danger"
                          title="Удалить"
                          disabled={saving}
                        >
                          <Icon name="trash" size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvaluationCriteriaManager;