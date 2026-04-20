import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth-store';
import Icon from '../common/icon';
import Logo from '../common/logo';
import './user-header.css';

/**
 * Компонент хедера с информацией о пользователе (для UI Showcase)
 */
export function ShowcaseUserHeader() {
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

  const isAdmin = user.role === 'admin';

  return (
    <div className={`showcase-header ${isAdmin ? 'showcase-header--admin' : ''}`}>
      <div className="showcase-header-content">
        <Logo variant="page" />

        {/* Кнопка выхода — всегда видна */}
        <button
          onClick={handleLogout}
          className={`showcase-header__logout-btn ${isAdmin ? 'showcase-header__logout-btn--admin' : ''}`}
          title="Выйти из аккаунта"
        >
          <Icon name="logout" size={18} />
          <span className="hidden sm:inline">Выйти</span>
        </button>

        {/* Меню пользователя */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="showcase-user-header hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
          >
            <div className="showcase-user-avatar">
              {getInitials()}
            </div>
            <div className="hidden sm:block">
              <div className="showcase-user-name">{getFullName()}</div>
              <div className="showcase-user-email">{user.email}</div>
            </div>
            <Icon name="chevron-down" size={20} className="text-gray-400" />
          </button>

          {/* Выпадающее меню */}
          {menuOpen && (
            <div className="showcase-user-menu">
              <div className="px-4 py-2 border-b border-gray-200">
                <div className="text-sm font-medium text-gray-900">
                  {getFullName()}
                </div>
                <div className="text-xs text-gray-500">{user.email}</div>
                {isAdmin && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                    Администратор
                  </span>
                )}
              </div>

              {/* Ссылка на админ-панель для администраторов */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      navigate('/admin');
                      setMenuOpen(false);
                    }}
                    className="showcase-user-menu-btn"
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="settings" size={16} />
                      Админ-панель
                    </div>
                  </button>
                  <div className="showcase-user-menu-divider"></div>
                </>
              )}

              <button
                onClick={handleLogout}
                className="showcase-user-menu-btn"
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

export default ShowcaseUserHeader;
