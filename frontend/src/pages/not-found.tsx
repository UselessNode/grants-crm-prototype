import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';

export function NotFoundPage() {
  const { user } = useAuthStore();

  const backPath = user ? '/applications' : '/login';
  const backLabel = user ? 'К заявкам' : 'На страницу входа';

  return (
    <div className="auth-container">
      <div className="auth-card text-center">
        <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
        <h2 className="auth-title">Страница не найдена</h2>
        <p className="text-gray-600 mb-6">
          Страница, которую вы ищете, не существует или была перемещена.
        </p>
        <Link
          to={backPath}
          className="auth-btn"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
