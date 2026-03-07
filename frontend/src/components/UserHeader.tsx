import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Icon from './Icon';
import logoWatermelon from '../assets/images/Melon.png';

/**
 * Компонент хедера с информацией о пользователе
 */
export default function UserHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * Обработка выхода
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Закрытие меню при клике вне его
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Получить инициалы пользователя
   */
  const getInitials = () => {
    if (!user) return '?';

    const surname = user.surname || '';
    const name = user.name || '';

    return `${surname.charAt(0)}${name.charAt(0)}`.toUpperCase() || '?';
  };

  /**
   * Получить полное имя пользователя
   */
  const getFullName = () => {
    if (!user) return '';

    const parts = [user.surname, user.name, user.patronymic].filter(Boolean);
    return parts.join(' ') || user.email;
  };

  if (!user) return null;

  return (
    <div className="page-header">
      <div className="page-header-content">
        {/* Логотип */}
        <div className="page-logo-wrapper">
          <img src={logoWatermelon} alt="Арбузные гранты" className="page-logo" />
          <span className="page-logo-text">Арбузные гранты</span>
        </div>

        {/* Меню пользователя */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="user-header hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
          >
            <div className="user-avatar">
              {getInitials()}
            </div>
            <div className="hidden sm:block">
              <div className="user-name">{getFullName()}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <Icon name="chevron-down" size={20} className="text-gray-400" />
          </button>

          {/* Выпадающее меню */}
          {menuOpen && (
            <div className="user-menu">
              <div className="px-4 py-2 border-b border-gray-200">
                <div className="text-sm font-medium text-gray-900">
                  {getFullName()}
                </div>
                <div className="text-xs text-gray-500">{user.email}</div>
                {user.role === 'admin' && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary-100 text-primary-800 rounded-full">
                    Администратор
                  </span>
                )}
              </div>

              {/* Ссылка на админ-панель для администраторов */}
              {user.role === 'admin' && (
                <>
                  <button
                    onClick={() => {
                      navigate('/admin');
                      setMenuOpen(false);
                    }}
                    className="user-menu-btn"
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="settings" size={16} />
                      Админ-панель
                    </div>
                  </button>
                  <div className="user-menu-divider"></div>
                </>
              )}

              <button
                onClick={handleLogout}
                className="user-menu-btn"
              >
                <div className="flex items-center gap-2">
                  <Icon name="logout" size={16} />
                  Выйти
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
