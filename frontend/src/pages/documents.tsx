import { useState, useEffect } from 'react';
import { UserPanelLayout } from '../components/UserPanel/user-panel-layout';
import { Icon } from '../components/common/icon';
import { adminService } from '../services/adminService';
import type { Document, DocumentCategory } from '../types';

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
      const blob = await adminService.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Ошибка при скачивании документа');
      console.error(err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <UserPanelLayout showTabs={true} useMainNavigation={true}>
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Документы</h1>
          <p className="text-gray-600">
            В этом разделе размещены все необходимые документы для участия в грантовой программе
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
                {documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Icon name="document" size={20} className="text-red-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                          <div className="text-xs text-gray-500">{doc.file_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {doc.category_name ? (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
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
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                      >
                        <Icon name="download" size={16} />
                        Скачать
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Информация */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Документы для участников</p>
              <p>
                В этом разделе размещены все необходимые документы для участия в грантовой программе.
                Рекомендуем ознакомиться с положением о гранте и методическими рекомендациями перед заполнением заявки.
              </p>
            </div>
          </div>
        </div>
      </div>
    </UserPanelLayout>
  );
}

export default Documents;
