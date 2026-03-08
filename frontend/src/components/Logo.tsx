import logoWatermelon from '../assets/images/Melon.png';

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
  if (variant === 'page') {
    return (
      <div className="page-logo-wrapper">
        <img src={logoWatermelon} alt={logoText} className="page-logo" />
        <span className="page-logo-text">{logoText}</span>
      </div>
    );
  }

  return (
    <div className="auth-logo">
      <img src={logoWatermelon} alt={logoText} />
      <h1 className="auth-logo-text">{logoText}</h1>
    </div>
  );
}
