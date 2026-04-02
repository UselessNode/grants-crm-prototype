import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { UserPanelLayout } from '../components/UserPanel/user-panel-layout';
import { AdminUsersTable, EditUserModal } from '../components/admin-panel';
import type { User } from '../services/adminService';

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    loadUsers();
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
        <AdminUsersTable
          users={users}
          onEdit={(u: User) => setEditingUser(u)}
          onDelete={(u: User) => setDeletingUser(u)}
        />
      )}

      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSave={async (data) => {
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

      {deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="auth-card">
            <h2 className="auth-title">Подтверждение удаления</h2>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить пользователя <strong>{deletingUser.email}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingUser(null)} className="btn btn-cancel">Отмена</button>
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
    </UserPanelLayout>
  );
}

export default AdminUsers;
