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

  return (
    <UserPanelLayout showTabs={true} useMainNavigation={true}>
      <div className="max-w-6xl mx-auto">
        {/* Подзаголовок */}
        <div className="mb-6">
          <p className="text-gray-600">
            В этом разделе размещены все необходимые документы для участия в грантовой программе.
            Рекомендуем ознакомиться с положением о гранте и методическими рекомендациями перед заполнением заявки.
          </p>
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
                        <button
                          onClick={() => handleDownload(doc)}
                          className="btn"
                        >
                          <Icon name="download" size={16} />
                          Скачать
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </UserPanelLayout>
  );
}

export default Documents;
