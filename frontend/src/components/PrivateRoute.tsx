import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import SessionWarningModal from './SessionWarningModal';

interface PrivateRouteProps {
  children: ReactNode;
}

/**
 * Компонент защиты маршрутов
 * Перенаправляет на страницу входа, если пользователь не авторизован
 */
export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, token, sessionWarning, extendSession, setSessionWarning } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !token) {
    // Перенаправляем на страницу входа, сохраняя текущий URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      {sessionWarning && (
        <SessionWarningModal
          onExtend={extendSession}
          onDismiss={() => setSessionWarning(false)}
        />
      )}
      {children}
    </>
  );
}
