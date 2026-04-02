import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { UserPanelLayout } from '../components/UserPanel/user-panel-layout';
import { AddExpertModal, EditExpertModal } from '../components/admin-panel';
import type { Expert } from '../types';

export function AdminExperts() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [deletingExpert, setDeletingExpert] = useState<Expert | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadExperts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getExperts();
      setExperts(data.data);
    } catch (err) {
      setError('Ошибка загрузки экспертов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperts();
  }, []);

  return (
    <UserPanelLayout showTabs={true} useMainNavigation={true}>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Список экспертов</h2>
            <button onClick={() => setIsAddModalOpen(true)} className="btn-add-icon">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить эксперта
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Доп. информация</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {experts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Эксперты ещё не добавлены</td>
                </tr>
              ) : (
                experts.map(expert => (
                  <tr key={expert.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expert.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {`${expert.surname || ''} ${expert.name || ''}`.trim() || '—'}
                      </div>
                      {expert.patronymic && (
                        <div className="text-sm text-gray-500">{expert.patronymic}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expert.extra_info || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button onClick={() => setEditingExpert(expert)} className="text-blue-600 hover:text-blue-800 hover:underline mr-3">
                        Редактировать
                      </button>
                      <button onClick={() => setDeletingExpert(expert)} className="text-red-600 hover:text-red-800 hover:underline">
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <AddExpertModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onExpertAdded={() => {
          loadExperts();
          setIsAddModalOpen(false);
        }}
      />

      <EditExpertModal
        isOpen={!!editingExpert}
        onClose={() => setEditingExpert(null)}
        expert={editingExpert}
        onSave={async (data) => {
          if (!editingExpert || editingExpert.id === undefined) return;
          setLoading(true);
          try {
            await adminService.updateExpert(editingExpert.id, data);
            await loadExperts();
            setEditingExpert(null);
          } catch (err) {
            setError('Ошибка обновления эксперта');
            console.error(err);
          } finally {
            setLoading(false);
          }
        }}
      />

      {deletingExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="auth-card">
            <h2 className="auth-title">Подтверждение удаления</h2>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить эксперта <strong>{`${deletingExpert.surname} ${deletingExpert.name}`.trim()}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingExpert(null)} className="btn btn-cancel">Отмена</button>
              <button
                onClick={async () => {
                  if (deletingExpert.id === undefined) return;
                  setLoading(true);
                  try {
                    await adminService.deleteExpert(deletingExpert.id);
                    await loadExperts();
                    setDeletingExpert(null);
                  } catch (err) {
                    setError('Ошибка удаления эксперта');
                    console.error(err);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="btn btn-danger"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </UserPanelLayout>
  );
}

export default AdminExperts;
