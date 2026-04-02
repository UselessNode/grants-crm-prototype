import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Table, type TableColumn } from '../../ui/table';
import type { User } from '../../../services/adminService';

type AdminUsersTableProps = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export function AdminUsersTable({ users, onEdit, onDelete }: AdminUsersTableProps) {
  const columns: TableColumn<User>[] = [
    {
      field: 'id',
      header: 'ID',
      width: 80,
    },
    {
      field: 'name',
      header: 'ФИО',
      render: (user) => (
        <span className="text-gray-900">
          {`${user.surname || ''} ${user.name || ''}`.trim() || '—'}
        </span>
      ),
    },
    {
      field: 'email',
      header: 'Email',
    },
    {
      field: 'role',
      header: 'Роль',
      render: (user) => (
        <Badge variant={user.role === 'admin' ? 'info' : 'default'} size="sm">
          {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
        </Badge>
      ),
    },
    {
      field: 'created_at',
      header: 'Дата регистрации',
      render: (user) => (
        <span className="text-gray-500">
          {user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '—'}
        </span>
      ),
    },
    {
      field: 'actions',
      header: 'Действия',
      width: 200,
      render: (user) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(user)}
          >
            Редактировать
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(user)}
            disabled={user.role === 'admin'}
            title={user.role === 'admin' ? 'Нельзя удалить администратора' : 'Удалить'}
          >
            Удалить
          </Button>
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={users} />;
}
