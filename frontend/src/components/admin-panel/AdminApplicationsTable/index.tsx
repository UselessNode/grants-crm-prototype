import { Link } from 'react-router-dom';
import type { Application } from '../../../types';
import './AdminApplicationsTable.css';

type AdminApplicationsTableProps = {
  applications: (Application & { owner_email?: string; owner_name?: string })[];
};

export function AdminApplicationsTable({ applications }: AdminApplicationsTableProps) {
  return (
    <div className="AdminApplicationsTable">
      <table className="AdminApplicationsTable__table">
        <thead className="AdminApplicationsTable__header">
          <tr>
            <th className="AdminApplicationsTable__th">ID</th>
            <th className="AdminApplicationsTable__th">Название</th>
            <th className="AdminApplicationsTable__th">Владелец</th>
            <th className="AdminApplicationsTable__th">Статус</th>
            <th className="AdminApplicationsTable__th">Дата создания</th>
            <th className="AdminApplicationsTable__th">Действия</th>
          </tr>
        </thead>
        <tbody className="AdminApplicationsTable__tbody">
          {applications.map(app => (
            <tr key={app.id}>
              <td className="AdminApplicationsTable__td AdminApplicationsTable__tdPrimary">{app.id}</td>
              <td className="AdminApplicationsTable__td AdminApplicationsTable__tdPrimary">{app.title}</td>
              <td className="AdminApplicationsTable__td AdminApplicationsTable__tdSecondary">
                {app.owner_name || app.owner_email || `ID: ${app.owner_id || '—'}`}
              </td>
              <td className="AdminApplicationsTable__td">
                <span className="AdminApplicationsTable__status">
                  {app.status_name || 'Черновик'}
                </span>
              </td>
              <td className="AdminApplicationsTable__td AdminApplicationsTable__tdSecondary">
                {app.created_at ? new Date(app.created_at).toLocaleDateString('ru-RU') : '—'}
              </td>
              <td className="AdminApplicationsTable__td">
                <Link
                  to={`/applications/${app.id}`}
                  className="AdminApplicationsTable__link"
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
