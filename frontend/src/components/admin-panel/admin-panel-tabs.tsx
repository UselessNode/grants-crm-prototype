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
    <nav className="bg-white border-b">
      <div className="container mx-auto px-6">
        <div className="flex space-x-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}