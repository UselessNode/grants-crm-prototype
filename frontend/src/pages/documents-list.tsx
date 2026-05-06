import { useState, useEffect } from 'react';
import { UserPanelLayout } from '../components/UserPanel/user-panel-layout';
import { Icon } from '../components/common/icon';
import { adminService } from '../services/adminService';
import { formatFileSize, downloadDocument } from '../utils/documentHelpers';
import type { Document, DocumentCategory } from '../types';

// ========== Функция генерации цвета по названию категории ==========
// Возвращает два цвета: для фона (светлый) и для иконки (тёмный насыщенный)
const getCategoryColors = (categoryName?: string) => {
  // Дефолтные цвета, если категория не указана
  if (!categoryName) {
    return { bg: '#f3f4f6', text: '#6b7280' }; // серый
  }

  // Простой хеш строки (Bernstein)
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = (hash * 33) ^ categoryName.charCodeAt(i);
  }
  const hue = Math.abs(hash % 360); // оттенок от 0 до 359

  // Фон: светлый (насыщенность 20%, яркость 92%)
  const bg = `hsl(${hue}, 70%, 92%)`;
  // Иконка: насыщенный, средней яркости (60%)
  const text = `hsl(${hue}, 80%, 40%)`;

  return { bg, text };
};
// ================================================================

export function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    file: null as File | null,
  });
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsResponse, catsResponse] = await Promise.all([
        adminService.getDocuments({
          limit: 50,
          category_id: selectedCategory || undefined,
        }),
        adminService.getDocumentCategories(),
      ]);
      setDocuments(docsResponse.data);
      setCategories(catsResponse.data);
    } catch (err) {
      setError('Ошибка загрузки документов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      await downloadDocument(doc);
    } catch (err) {
      setError('Ошибка при скачивании документа');
      console.error(err);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category_id || !formData.file) {
      setError('Заполните все поля');
      return;
    }

    setUploadLoading(true);
    try {
      // Здесь будет логика загрузки документа на сервер
      // await adminService.uploadDocument(formData);
      
      // Временная задержка для демонстрации
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Очищаем форму и закрываем модалку
      setFormData({ title: '', category_id: '', file: null });
      setShowAddModal(false);
      
      // Перезагружаем документы
      await loadData();
    } catch (err) {
      setError('Ошибка при добавлении документа');
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEditDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category_id) {
      setError('Заполните все обязательные поля');
      return;
    }

    setUploadLoading(true);
    try {
      // Здесь будет логика обновления документа на сервере
      // await adminService.updateDocument(editingDoc?.id, formData);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setFormData({ title: '', category_id: '', file: null });
      setShowEditModal(false);
      setEditingDoc(null);
      
      await loadData();
    } catch (err) {
      setError('Ошибка при редактировании документа');
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deletingDocId) return;

    setUploadLoading(true);
    try {
      // Здесь будет логика удаления документа на сервере
      // await adminService.deleteDocument(deletingDocId);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setShowDeleteConfirm(false);
      setDeletingDocId(null);
      
      await loadData();
    } catch (err) {
      setError('Ошибка при удалении документа');
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  const openEditModal = (doc: Document) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      category_id: doc.category_id?.toString() || '',
      file: null,
    });
    setShowEditModal(true);
  };

  return (
    <UserPanelLayout showTabs={true} useMainNavigation={true}>
      <div className="max-w-6xl mx-auto">
        {/* Подзаголовок и кнопка добавления */}
        <div className="mb-6 flex justify-between items-start">
          <p className="text-gray-600">
            В этом разделе размещены все необходимые документы для участия в грантовой программе.
            Рекомендуем ознакомиться с положением о гранте и методическими рекомендациями перед заполнением заявки.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <Icon name="plus" size={16} />
            Добавить
          </button>
        </div>

        {/* Фильтр по категориям */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              Все
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Список документов */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
            Документы не найдены
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Размер
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действие
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map(doc => {
                  // Получаем цвета для текущего документа
                  const { bg, text } = getCategoryColors(doc.category_name);

                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Иконка с динамическим цветом */}
                          <div
                            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: bg }}
                          >
                            <Icon name="document" size={20} style={{ color: text }} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                            <div className="text-xs text-gray-500">{doc.file_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {doc.category_name ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full"
                            style={{ backgroundColor: bg, color: text }}>
                            {doc.category_name}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatFileSize(doc.file_size)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString('ru-RU') : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleDownload(doc)}
                            className="btn"
                          >
                            <Icon name="download" size={16} />
                            Скачать
                          </button>
                          <button
                            onClick={() => openEditModal(doc)}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            <Icon name="edit" size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingDocId(doc.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Модалка добавления документа */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              {/* Заголовок */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Добавить документ</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={uploadLoading}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              {/* Форма */}
              <form onSubmit={handleAddDocument} className="p-6 space-y-4">
                {/* Название документа */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название документа
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Введите название"
                    disabled={uploadLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Категория */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    disabled={uploadLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Загрузка файла */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Файл
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                      disabled={uploadLoading}
                      className="w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-100 file:text-blue-600 hover:file:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {formData.file && (
                      <p className="mt-2 text-xs text-gray-600">
                        Выбран: {formData.file.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Кнопки */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={uploadLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={uploadLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploadLoading ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Загрузка...
                      </>
                    ) : (
                      'Добавить'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Модалка редактирования документа */}
        {showEditModal && editingDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Редактировать документ</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={uploadLoading}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              <form onSubmit={handleEditDocument} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название документа
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Введите название"
                    disabled={uploadLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    disabled={uploadLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Файл (опционально)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                      disabled={uploadLoading}
                      className="w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-100 file:text-blue-600 hover:file:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {formData.file && (
                      <p className="mt-2 text-xs text-gray-600">
                        Новый файл: {formData.file.name}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Текущий файл: {editingDoc.file_name}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    disabled={uploadLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={uploadLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploadLoading ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Сохранение...
                      </>
                    ) : (
                      'Сохранить'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Диалог подтверждения удаления */}
        {showDeleteConfirm && deletingDocId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Удалить документ?</h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-gray-600">
                  Вы уверены, что хотите удалить этот документ? Это действие невозможно отменить.
                </p>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={uploadLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDeleteDocument}
                  disabled={uploadLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadLoading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Удаление...
                    </>
                  ) : (
                    'Удалить'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserPanelLayout>
  );
}

export default Documents;
