import { Link, useLocation } from 'react-router-dom';

export type UserPanelTab = 'applications' | 'documents' | 'profile';

export function UserPanelTabs() {
  const location = useLocation();

  const tabs: { id: UserPanelTab; label: string; path: string }[] = [
    { id: 'applications', label: 'Заявки', path: '/applications' },
    { id: 'documents', label: 'Документы', path: '/documents' },
    { id: 'profile', label: 'Профиль', path: '/profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/applications') {
      return location.pathname.startsWith('/applications');
    }
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-6">
        <div className="flex space-x-4">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              to={tab.path}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                isActive(tab.path)
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
