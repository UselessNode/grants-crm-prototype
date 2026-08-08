import { useState } from 'react';
import { UserPanelLayout } from '../components/UserPanel/user-panel-layout';
import { EvaluationCriteriaManager } from '../components/admin-panel';
import { adminService } from '../services/adminService';

export function AdminEvaluationCriteria() {
  const [selectedTenderId, setSelectedTenderId] = useState<number | null>(null);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  const handleOpenManager = (tenderId: number) => {
    setSelectedTenderId(tenderId);
    setIsManagerOpen(true);
  };

  const handleCloseManager = () => {
    setIsManagerOpen(false);
    setSelectedTenderId(null);
  };

  return (
    <UserPanelLayout showTabs={true} useMainNavigation={true}>
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Критерии оценки</h1>
            <p className="text-gray-600 mt-2">
              Управление критериями оценки для конкурсов (тендеров)
            </p>
          </div>
        </div>

        {/* карточка с описанием */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            О критериях оценки
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Здесь вы можете создавать и редактировать критерии оценки для каждого конкурса (тендера).
            Каждый критерий имеет:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
            <li><strong>Название</strong> - имя критерия (например: "Крутость", "Стиль", "Актуальность")</li>
            <li><strong>Описание</strong> - подробное описание критерия</li>
            <li><strong>Минимальное и максимальное значение</strong> - диапазон оценки</li>
            <li><strong>Вес</strong> - важность критерия в общей оценке</li>
          </ul>
          <p className="text-gray-600 mt-4">
            Эксперты будут оценивать заявки по заданным критериям.
          </p>
        </div>

        {/* Список тендеров с кнопками управления */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Выберите конкурс для управления критериями
            </h2>
          </div>

          <TendersList onSelectTender={handleOpenManager} />
        </div>

        {/* Модальное окно управления критериями */}
        {selectedTenderId && isManagerOpen && (
          <EvaluationCriteriaManager
            tenderId={selectedTenderId}
            onClose={handleCloseManager}
            onCriteriaUpdated={() => {
              // При обновлении критериев можно обновить данные
              console.log('Критерии обновлены');
            }}
          />
        )}
      </div>
    </UserPanelLayout>
  );
}

// Компонент списка тендеров
function TendersList({ onSelectTender }: { onSelectTender: (tenderId: number) => void }) {
  const [tenders, setTenders] = useState<{ id: number; name: string; description?: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    const loadTenders = async () => {
      setLoading(true);
      try {
        const response = await adminService.getTenders();
        setTenders(response.data);
      } catch (err) {
        setError('Ошибка загрузки списка конкурсов');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTenders();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Загрузка списка конкурсов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>
    );
  }

  if (tenders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Нет доступных конкурсов. Создайте сначала конкурс в разделе "Справочники".
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tenders.map((tender) => (
        <div
          key={tender.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          onClick={() => onSelectTender(tender.id)}
        >
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{tender.name}</h3>
            {tender.description && (
              <p className="text-sm text-gray-600 mt-1">{tender.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Управлять критериями</span>
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminEvaluationCriteria;