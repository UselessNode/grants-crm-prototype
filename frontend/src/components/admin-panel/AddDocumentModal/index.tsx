// THIS IS CORRECT

import { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import type { Document, DocumentCategory } from '../../../types';
import './AddDocumentModal.css';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: Document | null;
  onDocumentAdded?: () => void;
}

interface DocumentFormData {
  title: string;
  description: string;
  category_id: number | null;
  is_template: boolean;
  template_type: string;
}

export function AddDocumentModal({
  isOpen,
  onClose,
  document,
  onDocumentAdded,
}: AddDocumentModalProps) {
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    description: '',
    category_id: null,
    is_template: false,
    template_type: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!document;

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (document) {
        setFormData({
          title: document.title,
          description: document.description || '',
          category_id: document.category_id || null,
          is_template: document.is_template || false,
          template_type: document.template_type || '',
        });
        setFile(null);
      } else {
        setFormData({
          title: '',
          description: '',
          category_id: null,
          is_template: false,
          template_type: '',
        });
        setFile(null);
      }
    }
    setError(null);
  }, [isOpen, document]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await adminService.getDocumentCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditMode && !file) {
      setError('Выберите файл для загрузки');
      return;
    }

    if (!formData.title) {
      setError('Название документа обязательно');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditMode && document) {
        // Обновление документа
        await adminService.updateDocument(document.id, {
          title: formData.title,
          description: formData.description || null,
          category_id: formData.category_id,
          is_template: formData.is_template,
          template_type: formData.template_type || null,
        });

        // Если файл заменён
        if (file) {
          await adminService.updateDocumentFile(document.id, file);
        }
      } else {
        // Создание нового документа
        if (!file) {
          throw new Error('Файл не выбран');
        }
        await adminService.createDocument({
          title: formData.title,
          description: formData.description || null,
          category_id: formData.category_id,
          is_template: formData.is_template,
          template_type: formData.template_type || null,
          file,
        });
      }

      onClose();
      setFormData({
        title: '',
        description: '',
        category_id: null,
        is_template: false,
        template_type: '',
      });
      setFile(null);
      onDocumentAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении документа');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      // Проверка размера (макс 10 МБ)
      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError('Размер файла не должен превышать 10 МБ');
        setFile(null);
        e.target.value = '';
        return;
      }
      // Проверка типа файла
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Разрешены только файлы PDF, JPG, PNG');
        setFile(null);
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="AddDocumentModal">
      <div className="AddDocumentModal__overlay" onClick={onClose} />
      <div className="AddDocumentModal__content">
        <div className="AddDocumentModal__header">
          <h2 className="AddDocumentModal__title">
            {isEditMode ? 'Редактирование документа' : 'Добавить документ'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="AddDocumentModal__close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="AddDocumentModal__form">
          {error && (
            <div className="AddDocumentModal__error">{error}</div>
          )}

          <div className="AddDocumentModal__field">
            <label className="AddDocumentModal__label">
              Название документа <span className="required-mark">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="AddDocumentModal__input"
              placeholder="Например: Положение о гранте"
              required
            />
          </div>

          <div className="AddDocumentModal__field">
            <label className="AddDocumentModal__label">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="AddDocumentModal__textarea"
              rows={3}
              placeholder="Краткое описание документа..."
            />
          </div>

          <div className="AddDocumentModal__field">
            <label className="AddDocumentModal__label">Категория</label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })}
              className="AddDocumentModal__select"
              disabled={loadingCategories}
            >
              <option value="">Без категории</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="AddDocumentModal__field">
            <label className="AddDocumentModal__label">
              <input
                type="checkbox"
                checked={formData.is_template}
                onChange={(e) => setFormData({ ...formData, is_template: e.target.checked })}
                className="mr-2"
              />
              Это шаблон/образец
            </label>
          </div>

          {formData.is_template && (
            <div className="AddDocumentModal__field">
              <label className="AddDocumentModal__label">Тип шаблона</label>
              <select
                value={formData.template_type}
                onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
                className="AddDocumentModal__select"
              >
                <option value="">Выберите тип</option>
                <option value="consent_adult">Согласие для совершеннолетних (14+)</option>
                <option value="consent_minor">Согласие для несовершеннолетних (до 14)</option>
              </select>
            </div>
          )}

          <div className="AddDocumentModal__field">
            <label className="AddDocumentModal__label">
              {isEditMode ? 'Заменить файл (необязательно)' : 'Файл'} <span className="required-mark">{isEditMode ? '' : '*'}</span>
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="AddDocumentModal__file-input"
            />
            {isEditMode && document && !file && (
              <p className="text-sm text-gray-500 mt-1">
                Текущий файл: {document.file_name} ({Math.round(document.file_size / 1024)} КБ)
              </p>
            )}
            {file && (
              <p className="text-sm text-gray-500 mt-1">
                Выбран файл: {file.name} ({Math.round(file.size / 1024)} КБ)
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Форматы: PDF, JPG, PNG. Максимальный размер: 10 МБ
            </p>
          </div>

          <div className="AddDocumentModal__actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (isEditMode ? 'Сохранение...' : 'Загрузка...') : (isEditMode ? 'Сохранить' : 'Загрузить')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDocumentModal;
