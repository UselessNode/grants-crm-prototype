import './AdminPanelTabs.css';

type AdminPanelTabsProps = {
  activeTab: 'dashboard' | 'users' | 'applications' | 'directories';
  setActiveTab: (tab: 'dashboard' | 'users' | 'applications' | 'directories') => void;
};

export function AdminPanelTabs({ activeTab, setActiveTab }: AdminPanelTabsProps) {
  const tabs = [
    { id: 'dashboard', label: 'Обзор' },
    { id: 'users', label: 'Пользователи' },
    { id: 'applications', label: 'Заявки' },
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
