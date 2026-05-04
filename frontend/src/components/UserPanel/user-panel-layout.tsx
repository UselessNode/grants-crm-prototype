import { UserPanelTabs } from './user-panel-tabs';
import { MainNavigation } from '../common/main-navigation';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth-store';
import Icon from '../common/icon';
import Logo from '../common/logo';

type UserPanelLayoutProps = {
  children: React.ReactNode;
  showTabs?: boolean;
  showLogout?: boolean;
  useMainNavigation?: boolean;
};

export function UserPanelLayout({
  children,
  showTabs = true,
  showLogout = true,
  useMainNavigation = true
}: UserPanelLayoutProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  // Фон хедера в зависимости от роли
  const headerBg = user?.role === 'admin'
    ? 'bg-gray-400'
    : 'bg-green-600';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      {/* Хедер с логотипом и кнопкой выхода */}
      <header className={`shadow-sm border-b ${headerBg}`}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo variant="page" />
          {showLogout && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors font-medium inline-flex items-center gap-2 text-sm"
              title="Выйти"
            >
              <Icon name="logout" size={18} />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          )}
        </div>
      </header>

      {/* Вкладки */}
      {showTabs && (
        useMainNavigation ? <MainNavigation /> : <UserPanelTabs />
      )}

      {/* Контент */}
      <main className="container mx-auto px-2 py-4 flex-grow">
        {children}
      </main>

      {/* Футер */}
      <footer className="bg-gray-100 border-t border-gray-200 py-4">
        <div className="container mx-auto px-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} — Арбузные гранты 🍉
        </div>
      </footer>
    </div>
  );
}
