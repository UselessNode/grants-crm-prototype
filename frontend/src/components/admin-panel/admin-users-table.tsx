import type { User } from '../../services/adminService';

type AdminUsersTableProps = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export function AdminUsersTable({ users, onEdit, onDelete }: AdminUsersTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата регистрации</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map(u => (
            <tr key={u.id}>
              <td className="px-6 py-4 text-sm text-gray-900">{u.id}</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {`${u.surname || ''} ${u.name || ''}`.trim() || '—'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{u.email}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  u.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {u.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {u.created_at ? new Date(u.created_at).toLocaleDateString('ru-RU') : '—'}
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(u)}
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                    title="Редактировать"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => onDelete(u)}
                    className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                    title="Удалить"
                    disabled={u.role === 'admin'}
                  >
                    Удалить
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
