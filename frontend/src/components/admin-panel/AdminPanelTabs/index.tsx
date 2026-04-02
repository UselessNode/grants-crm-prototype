import './AdminPanelTabs.css';

type AdminPanelTabsProps = {
  activeTab: 'dashboard' | 'users' | 'applications' | 'directories' | 'experts' | 'documents';
  setActiveTab: (tab: 'dashboard' | 'users' | 'applications' | 'directories' | 'experts' | 'documents') => void;
};

export function AdminPanelTabs({ activeTab, setActiveTab }: AdminPanelTabsProps) {
  const tabs = [
    { id: 'users', label: 'Пользователи' },
    { id: 'applications', label: 'Заявки' },
    { id: 'experts', label: 'Эксперты' },
    { id: 'documents', label: 'Документы' },
    { id: 'directories', label: 'Справочники' },
  ];

  return (
    <nav className="AdminPanelTabs">
      <div className="AdminPanelTabs__container">
        <div className="AdminPanelTabs__list">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`AdminPanelTabs__tab ${
                activeTab === tab.id ? 'AdminPanelTabs__tab--active' : ''
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
