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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Пользователи</h2>
        <p className="text-4xl font-bold text-blue-600">{stats.users}</p>
        <button
          onClick={() => setActiveTab('users')}
          className="mt-4 text-blue-600 hover:underline text-sm"
        >
          Посмотреть всех →
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Заявки</h2>
        <p className="text-4xl font-bold text-green-600">{stats.applications}</p>
        <button
          onClick={() => setActiveTab('applications')}
          className="mt-4 text-blue-600 hover:underline text-sm"
        >
          Посмотреть все →
        </button>
      </div>
    </div>
  );
}