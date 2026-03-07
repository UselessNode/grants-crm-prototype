import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logoWatermelon from '../assets/images/Melon.png';

/**
 * Страница входа
 */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const from = (location.state as { from?: Location })?.from?.pathname || '/applications';

  /**
   * Обработка отправки формы
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Валидация
    const errors: { email?: string; password?: string } = {};

    if (!email) {
      errors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Введите корректный email';
    }

    if (!password) {
      errors.password = 'Пароль обязателен';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Попытка входа
    const result = await login(email, password);

    if (result.success) {
      navigate(from, { replace: true });
    } else if (result.error) {
      // Ошибка уже установлена в hook
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Логотип */}
        <div className="auth-logo">
          <img src={logoWatermelon} alt="Арбузные гранты" />
          <h1 className="auth-logo-text">Арбузные гранты</h1>
        </div>

        {/* Заголовок */}
        <h1 className="auth-title">Вход в систему</h1>
        <p className="auth-subtitle">
          Введите свои данные для входа в аккаунт
        </p>

        {/* Сообщение об ошибке */}
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className="mt-6">
          {/* Email */}
          <div className="auth-field-group">
            <label htmlFor="email" className="field-label-lg">
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`auth-input ${validationErrors.email ? 'auth-input-error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
              disabled={loading}
            />
            {validationErrors.email && (
              <p className="field-error">{validationErrors.email}</p>
            )}
          </div>

          {/* Пароль */}
          <div className="auth-field-group">
            <label htmlFor="password" className="field-label-lg">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              className={`auth-input ${validationErrors.password ? 'auth-input-error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
            {validationErrors.password && (
              <p className="field-error">{validationErrors.password}</p>
            )}
          </div>

          {/* Кнопка входа */}
          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        {/* Ссылка на регистрацию */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Нет аккаунта?{' '}
          <Link to="/register" className="auth-link">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
