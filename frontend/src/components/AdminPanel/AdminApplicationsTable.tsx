import { Link } from 'react-router-dom';
import type { Application } from '../../utils/types';

type AdminApplicationsTableProps = {
  applications: (Application & { owner_email?: string; owner_name?: string })[];
};

export function AdminApplicationsTable({ applications }: AdminApplicationsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Владелец</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата создания</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applications.map(app => (
            <tr key={app.id}>
              <td className="px-6 py-4 text-sm text-gray-900">{app.id}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{app.title}</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {app.owner_name || app.owner_email || `ID: ${app.owner_id || '—'}`}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {app.status_name || 'Черновик'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {app.created_at ? new Date(app.created_at).toLocaleDateString('ru-RU') : '—'}
              </td>
              <td className="px-6 py-4 text-sm">
                <Link
                  to={`/applications/${app.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Просмотр
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}