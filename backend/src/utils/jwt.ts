import jwt from 'jsonwebtoken';
import { User } from '../models/user';

/**
 * Интерфейс полезной нагрузки токена
 */
export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  role_id?: number | null;
}

/**
 * Секретный ключ для JWT
 * В продакшене используйте переменную окружения JWT_SECRET
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Время жизни токена - 7 дней
 */
const TOKEN_EXPIRATION = '7d';

/**
 * Время предупреждения о завершении сессии - 25 минут (в секундах)
 * То есть через 25 минут бездействия покажем предупреждение
 */
const SESSION_WARNING_TIME = 25 * 60; // 25 минут

/**
 * Сгенерировать JWT токен
 */
export function generateToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id!,
    email: user.email,
    role: user.role,
    role_id: user.role_id,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
}

/**
 * Проверить и декодировать токен
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Получить оставшееся время жизни токена в секундах
 */
export function getTokenRemainingTime(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded || !decoded.exp) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - now;

    return remaining > 0 ? remaining : 0;
  } catch (error) {
    return null;
  }
}

/**
 * Проверить, нужно ли показать предупреждение о завершении сессии
 * Возвращает true, если до истечения токена осталось меньше SESSION_WARNING_TIME
 */
export function shouldShowSessionWarning(token: string): boolean {
  const remaining = getTokenRemainingTime(token);
  if (remaining === null) {
    return false;
  }

  return remaining <= SESSION_WARNING_TIME && remaining > 0;
}

/**
 * Получить время до предупреждения о сессии в миллисекундах
 * Возвращает время, через которое нужно показать предупреждение
 */
export function getTimeUntilSessionWarning(token: string): number | null {
  const remaining = getTokenRemainingTime(token);
  if (remaining === null) {
    return null;
  }

  // Если уже пора показывать предупреждение или токен истёк
  if (remaining <= SESSION_WARNING_TIME) {
    return 0;
  }

  // Возвращаем время до момента предупреждения
  return (remaining - SESSION_WARNING_TIME) * 1000;
}

/**
 * Секретный ключ для JWT (экспорт для использования в других модулях)
 */
export { JWT_SECRET };
