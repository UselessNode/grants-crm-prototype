import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { useAuthStore } from '../store/auth-store';
import type { User } from '../services/adminService';
import type { Application, Expert, Status, Document } from '../types';
import { ApplicationsList, AddExpertModal, EditUserModal, EditExpertModal, AdminUsersTable, AdminDirectories, AdminPanelTabs, AdminDocumentsTable, AddDocumentModal } from '../components/admin-panel';

interface ExpertWithStats extends Expert {
  applicationsCount?: number;
}

/**
 * Страница админ-панели
 */
export function AdminPanel() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'users' | 'applications' | 'directories' | 'experts' | 'documents'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<(Application & { owner_email?: string; owner_name?: string })[]>([]);
  const [directions, setDirections] = useState<{ id: number; name: string; description?: string | null }[]>([]);
  const [tenders, setTenders] = useState<{ id: number; name: string; description?: string | null }[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [experts, setExperts] = useState<ExpertWithStats[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddExpertModalOpen, setIsAddExpertModalOpen] = useState(false);
  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [deletingExpert, setDeletingExpert] = useState<Expert | null>(null);

  // Проверка прав администратора
  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Доступ запрещён. Требуются права администратора.');
    }
  }, [user]);

  // Загрузка пользователей
  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, user]);

  // Загрузка заявок
  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'applications') {
      loadApplications();
      loadExperts(); // Загружаем экспертов для фильтров и назначения
      loadStatuses(); // Загружаем статусы для смены статуса
    }
  }, [activeTab, user]);

  // Загрузка справочников
  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'directories') {
      loadDirectories();
    }
  }, [activeTab, user]);

  // Загрузка экспертов
  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'experts') {
      loadExperts();
    }
  }, [activeTab, user]);

  // Загрузка документов
  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'documents') {
      loadDocuments();
    }
  }, [activeTab, user]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({ limit: 50 });
      setUsers(data.data);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await adminService.getApplications({ limit: 50 });
      setApplications(data.data);
    } catch (err) {
      setError('Ошибка загрузки заявок');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDirectories = async () => {
    setLoading(true);
    try {
      const [dirsData, tendersData] = await Promise.all([
        adminService.getDirections(),
        adminService.getTenders(),
      ]);
      setDirections(dirsData.data);
      setTenders(tendersData.data);
    } catch (err) {
      setError('Ошибка загрузки справочников');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDocuments({ limit: 50 });
      setDocuments(data.data);
    } catch (err) {
      setError('Ошибка загрузки документов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStatuses = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDirections(); // Используем getDirections как заглушку, т.к. statuses нет в adminService
      // Получаем статусы через отдельный запрос
      const api = (await import('../services/api')).default;
      const statusesResponse = await api.get('/statuses');
      setStatuses(statusesResponse.data.data || []);
    } catch (err) {
      setError('Ошибка загрузки статусов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Доступ запрещён</h1>
          <p className="text-red-600 mb-4">{error || 'Требуются права администратора'}</p>
          <Link to="/applications" className="text-blue-600 hover:underline">
            ← Вернуться к заявкам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Админ-панель</h1>
            <Link
              to="/applications"
              className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
            >
              ← К заявкам
            </Link>
          </div>
        </div>
      </header>

      {/* Вкладки */}
      <AdminPanelTabs
        activeTab={activeTab === 'experts' ? 'dashboard' : activeTab}
        setActiveTab={(tab) => setActiveTab(tab as typeof activeTab)}
      />

      {/* Контент */}
      <main className="container mx-auto px-6 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Пользователи */}
        {activeTab === 'users' && (
          <>
            <AdminUsersTable
              users={users}
              onEdit={(u: User) => setEditingUser(u)}
              onDelete={(u: User) => setDeletingUser(u)}
            />

            {/* Модальное окно редактирования пользователя */}
            <EditUserModal
              isOpen={!!editingUser}
              onClose={() => setEditingUser(null)}
              user={editingUser}
              onSave={async (data: { surname: string | null; name: string | null; patronymic: string | null; role_id: number }) => {
                if (!editingUser) return;
                setLoading(true);
                try {
                  await adminService.updateUser(editingUser.id, data);
                  await loadUsers();
                  setEditingUser(null);
                } catch (err) {
                  setError('Ошибка обновления пользователя');
                  console.error(err);
                } finally {
                  setLoading(false);
                }
              }}
            />

            {/* Подтверждение удаления */}
            {deletingUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Подтверждение удаления</h2>
                  <p className="text-gray-600 mb-6">
                    Вы уверены, что хотите удалить пользователя <strong>{deletingUser.email}</strong>?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setDeletingUser(null)}
                      className="btn btn-cancel"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await adminService.deleteUser(deletingUser.id);
                          await loadUsers();
                          setDeletingUser(null);
                        } catch (err) {
                          setError('Ошибка удаления пользователя');
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
          </>
        )}

        {/* Заявки */}
        {activeTab === 'applications' && (
          <ApplicationsList
            applications={applications}
            experts={experts}
            statuses={statuses}
            onExpertsAssigned={() => {
              loadApplications();
            }}
            onStatusChanged={() => {
              loadApplications();
            }}
          />
        )}

        {/* Справочники */}
        {activeTab === 'directories' && (
          <AdminDirectories directions={directions} tenders={tenders} />
        )}

        {/* Эксперты */}
        {activeTab === 'experts' && (
          <>
            <div className="experts-list-container">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Список экспертов</h2>
                <button
                  onClick={() => setIsAddExpertModalOpen(true)}
                  className="btn-add-icon"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Добавить эксперта
                </button>
              </div>
              <table className="experts-table">
                <thead className="experts-table-header">
                  <tr>
                    <th className="experts-th">ID</th>
                    <th className="experts-th">ФИО</th>
                    <th className="experts-th">Дополнительная информация</th>
                    <th className="experts-th">Дата добавления</th>
                    <th className="experts-th">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {experts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="experts-empty-state">
                        Эксперты ещё не добавлены
                      </td>
                    </tr>
                  ) : (
                    experts.map(expert => (
                      <tr key={expert.id} className="experts-table-row">
                        <td className="experts-td">{expert.id}</td>
                        <td className="experts-td">
                          <div className="font-medium text-gray-900">
                            {`${expert.surname || ''} ${expert.name || ''}`.trim() || '—'}
                          </div>
                          {expert.patronymic && (
                            <div className="text-sm text-gray-500">{expert.patronymic}</div>
                          )}
                        </td>
                        <td className="experts-td">
                          {expert.extra_info || (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="experts-td text-gray-500">
                          {expert.created_at ? new Date(expert.created_at).toLocaleDateString('ru-RU') : '—'}
                        </td>
                        <td className="experts-td">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingExpert(expert)}
                              className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                              title="Редактировать"
                            >
                              Редактировать
                            </button>
                            <button
                              onClick={() => setDeletingExpert(expert)}
                              className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                              title="Удалить"
                            >
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Модальное окно редактирования эксперта */}
            <EditExpertModal
              isOpen={!!editingExpert}
              onClose={() => setEditingExpert(null)}
              expert={editingExpert}
              onSave={async (data: { surname: string; name: string; patronymic: string | null; extra_info: string | null }) => {
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

            {/* Подтверждение удаления эксперта */}
            {deletingExpert && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Подтверждение удаления</h2>
                  <p className="text-gray-600 mb-6">
                    Вы уверены, что хотите удалить эксперта <strong>{`${deletingExpert.surname} ${deletingExpert.name}`.trim()}</strong>?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setDeletingExpert(null)}
                      className="btn btn-cancel"
                    >
                      Отмена
                    </button>
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
          </>
        )}

        {/* Документы */}
        {activeTab === 'documents' && (
          <>
            <div className="experts-list-container">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Управление документами</h2>
                <button
                  onClick={() => setIsAddDocumentModalOpen(true)}
                  className="btn-add-icon"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Добавить документ
                </button>
              </div>
              <AdminDocumentsTable
                documents={documents}
                onEdit={(doc: Document) => setEditingDocument(doc)}
                onDelete={(doc: Document) => setDeletingDocument(doc)}
                onDownload={async (doc: Document) => {
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
                }}
              />
            </div>

            {/* Модальное окно добавления/редактирования документа */}
            <AddDocumentModal
              isOpen={isAddDocumentModalOpen}
              onClose={() => setIsAddDocumentModalOpen(false)}
              document={editingDocument}
              onDocumentAdded={() => {
                loadDocuments();
                setEditingDocument(null);
              }}
            />

            {/* Подтверждение удаления документа */}
            {deletingDocument && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Подтверждение удаления</h2>
                  <p className="text-gray-600 mb-6">
                    Вы уверены, что хотите удалить документ <strong>{deletingDocument.title}</strong>?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setDeletingDocument(null)}
                      className="btn btn-cancel"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await adminService.deleteDocument(deletingDocument.id);
                          await loadDocuments();
                          setDeletingDocument(null);
                        } catch (err) {
                          setError('Ошибка удаления документа');
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
          </>
        )}
      </main>

      {/* Модальное окно добавления эксперта */}
      <AddExpertModal
        isOpen={isAddExpertModalOpen}
        onClose={() => setIsAddExpertModalOpen(false)}
        onExpertAdded={() => {
          loadExperts();
        }}
      />
    </div>
  );
}

export default AdminPanel;
