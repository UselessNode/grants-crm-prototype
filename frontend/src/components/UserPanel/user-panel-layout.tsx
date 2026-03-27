import { UserPanelTabs } from './user-panel-tabs';
import Logo from '../common/logo';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth-store';
import Icon from '../common/icon';

type UserPanelLayoutProps = {
  children: React.ReactNode;
};

export function UserPanelLayout({ children }: UserPanelLayoutProps) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хедер с логотипом */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <Logo variant="page" />
        </div>
      </header>

      {/* Вкладки с кнопкой выхода */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <UserPanelTabs />
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

      {/* Контент */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
