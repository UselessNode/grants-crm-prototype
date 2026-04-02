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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хедер с логотипом */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <Logo variant="page" />
        </div>
      </header>

      {/* Вкладки с опциональной кнопкой выхода */}
      {showTabs && (
        <>
          {useMainNavigation ? <MainNavigation /> : <UserPanelTabs />}
          {showLogout && <LogoutButton />}
        </>
      )}

      {/* Контент */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-6">
        <div className="flex justify-end items-center">
          <button
            onClick={handleLogout}
            className="py-4 px-4 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium inline-flex items-center gap-2"
            title="Выйти"
          >
            <Icon name="logout" size={18} />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </div>
    </div>
  );
}
