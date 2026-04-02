import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth-store';

export type MainTab = 'applications' | 'documents' | 'profile' | 'users' | 'experts' | 'directories';

export function MainNavigation() {
  const location = useLocation();
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'admin';

  const tabs: { id: MainTab; label: string; path: string }[] = [
    { id: 'applications', label: 'Заявки', path: '/applications' },
    { id: 'documents', label: 'Документы', path: '/documents' },
    { id: 'profile', label: 'Профиль', path: '/profile' },
  ];

  // Добавляем админ-вкладки только для администратора
  if (isAdmin) {
    tabs.push(
      { id: 'users', label: 'Пользователи', path: '/admin/users' },
      { id: 'experts', label: 'Эксперты', path: '/admin/experts' },
      { id: 'directories', label: 'Справочники', path: '/admin/directories' }
    );
  }

  const isActive = (tab: typeof tabs[0]) => {
    // Для обычных вкладок
    if (!tab.path.startsWith('/admin')) {
      return location.pathname === tab.path;
    }
    // Для админских вкладок
    return location.pathname === tab.path;
  };

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-6">
        <div className="flex space-x-4 overflow-x-auto">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              to={tab.path}
              className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                isActive(tab)
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
