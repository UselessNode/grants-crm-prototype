import { useEffect } from 'react';
import Icon from './Icon';

interface SessionWarningModalProps {
  onExtend: () => Promise<boolean>;
  onDismiss: () => void;
}

/**
 * Модальное окно предупреждения о завершении сессии
 * Показывается за 5 минут до истечения токена
 */
export default function SessionWarningModal({
  onExtend,
  onDismiss,
}: SessionWarningModalProps) {
  /**
   * Продлить сессию
   */
  const handleExtend = async () => {
    const success = await onExtend();
    if (success) {
      onDismiss();
    }
  };

  /**
   * Выйти из системы
   */
  const handleLogout = () => {
    // Очищаем auth store и перенаправляем на страницу входа
    localStorage.removeItem('auth-storage');
    window.location.href = '/login';
  };

  // Блокируем скролл фона
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="session-warning-modal">
      <div className="session-warning-content">
        {/* Иконка предупреждения */}
        <div className="w-12 h-12 text-yellow-500 mx-auto mb-4">
          <Icon name="warning" />
        </div>

        {/* Заголовок */}
        <h3 className="session-warning-title">
          Сессия скоро завершится
        </h3>

        {/* Сообщение */}
        <p className="session-warning-message">
          Ваша сессия истекает через 5 минут. Продлите сессию, чтобы продолжить работу без потери данных.
        </p>

        {/* Кнопки действий */}
        <div className="session-warning-actions">
          <button
            className="session-warning-btn-secondary"
            onClick={handleLogout}
          >
            Выйти
          </button>
          <button
            className="session-warning-btn-primary"
            onClick={handleExtend}
          >
            Продлить сессию
          </button>
        </div>
      </div>
    </div>
  );
}
