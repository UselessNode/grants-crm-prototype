import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth-store';
import logoWatermelon from '../../assets/images/Melon.png';

export interface LogoProps {
  variant?: 'auth' | 'page';
}

const logoText = "Арбузный грант";

/**
 * Компонент логотипа "Арбузные гранты"
 * Поддерживает два варианта отображения:
 * - auth: для страниц авторизации (Register, Login)
 * - page: для основных страниц с хедером
 */
export default function Logo({ variant = 'auth' }: LogoProps) {
  const { user } = useAuthStore();

  if (variant === 'page') {
    const destination = '/applications';

    return (
      <Link to={destination} className="page-logo-wrapper">
        <img src={logoWatermelon} alt={logoText} className="page-logo" />
        <span className="page-logo-text">{logoText}</span>
        {user?.role === 'admin' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/20 text-white border border-white/30">
            Admin
          </span>
        )}
      </Link>
    );
  }

  return (
    <div className="auth-logo">
      <img src={logoWatermelon} alt={logoText} />
      <h1 className="auth-logo-text">{logoText}</h1>
    </div>
  );
}
