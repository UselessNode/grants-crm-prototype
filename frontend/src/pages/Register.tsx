import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';

/**
 * Страница регистрации
 */
export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    surname: '',
    name: '',
    patronymic: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    surname?: string;
    name?: string;
  }>({});

  /**
   * Обработка изменения полей
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Очищаем ошибку при изменении поля
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Обработка отправки формы
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Валидация
    const errors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      surname?: string;
      name?: string;
    } = {};

    // Email
    if (!formData.email) {
      errors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Введите корректный email';
    }

    // Пароль
    if (!formData.password) {
      errors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов';
    }

    // Подтверждение пароля
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    // Фамилия
    if (!formData.surname) {
      errors.surname = 'Фамилия обязательна';
    }

    // Имя
    if (!formData.name) {
      errors.name = 'Имя обязательно';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Попытка регистрации
    const result = await register(
      formData.email,
      formData.password,
      formData.surname,
      formData.name,
      formData.patronymic
    );

    if (result.success) {
      navigate('/applications', { replace: true });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Logo variant="auth" />

        {/* Заголовок */}
        <h1 className="auth-title">Регистрация</h1>
        <p className="auth-subtitle">
          Создайте аккаунт для доступа к системе
        </p>

        {/* Сообщение об ошибке */}
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className="mt-6">
          {/* Фамилия */}
          <div className="auth-field-group">
            <label htmlFor="surname" className="field-label-lg">
              Фамилия <span className="required-mark">*</span>
            </label>
            <input
              type="text"
              id="surname"
              name="surname"
              className={`auth-input ${validationErrors.surname ? 'auth-input-error' : ''}`}
              value={formData.surname}
              onChange={handleChange}
              placeholder="Иванов"
              disabled={loading}
            />
            {validationErrors.surname && (
              <p className="field-error">{validationErrors.surname}</p>
            )}
          </div>

          {/* Имя */}
          <div className="auth-field-group">
            <label htmlFor="name" className="field-label-lg">
              Имя <span className="required-mark">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`auth-input ${validationErrors.name ? 'auth-input-error' : ''}`}
              value={formData.name}
              onChange={handleChange}
              placeholder="Иван"
              disabled={loading}
            />
            {validationErrors.name && (
              <p className="field-error">{validationErrors.name}</p>
            )}
          </div>

          {/* Отчество */}
          <div className="auth-field-group">
            <label htmlFor="patronymic" className="field-label-lg">
              Отчество
            </label>
            <input
              type="text"
              id="patronymic"
              name="patronymic"
              className="auth-input"
              value={formData.patronymic}
              onChange={handleChange}
              placeholder="Иванович"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="auth-field-group">
            <label htmlFor="email" className="field-label-lg">
              Email <span className="required-mark">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`auth-input ${validationErrors.email ? 'auth-input-error' : ''}`}
              value={formData.email}
              onChange={handleChange}
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
              Пароль <span className="required-mark">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`auth-input ${validationErrors.password ? 'auth-input-error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
            />
            {validationErrors.password && (
              <p className="field-error">{validationErrors.password}</p>
            )}
          </div>

          {/* Подтверждение пароля */}
          <div className="auth-field-group">
            <label htmlFor="confirmPassword" className="field-label-lg">
              Подтверждение пароля <span className="required-mark">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`auth-input ${validationErrors.confirmPassword ? 'auth-input-error' : ''}`}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
            />
            {validationErrors.confirmPassword && (
              <p className="field-error">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* Кнопка регистрации */}
          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        {/* Ссылка на вход */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="auth-link">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
