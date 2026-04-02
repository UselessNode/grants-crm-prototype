import './AdminDashboard.css';

type AdminDashboardProps = {
  stats: {
    users: number;
    applications: number;
  } | null;
  setActiveTab: (tab: 'users' | 'applications') => void;
};

export function AdminDashboard({ stats, setActiveTab }: AdminDashboardProps) {
  if (!stats) return null;

  return (
    <div className="AdminDashboard">
      <div className="AdminDashboard__card">
        <h2 className="AdminDashboard__title">Пользователи</h2>
        <p className="AdminDashboard__value AdminDashboard__value--blue">{stats.users}</p>
        <button
          onClick={() => setActiveTab('users')}
          className="AdminDashboard__link"
        >
          Посмотреть всех →
        </button>
      </div>

      <div className="AdminDashboard__card">
        <h2 className="AdminDashboard__title">Заявки</h2>
        <p className="AdminDashboard__value AdminDashboard__value--green">{stats.applications}</p>
        <button
          onClick={() => setActiveTab('applications')}
          className="AdminDashboard__link"
        >
          Посмотреть все →
        </button>
      </div>
    </div>
  );
}
