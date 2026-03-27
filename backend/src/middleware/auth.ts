import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { UserModel } from '../models/user';

/**
 * Расширенный интерфейс Request с данными пользователя
 */
export interface AuthRequest extends Request {
  user?: TokenPayload & {
    surname?: string | null;
    name?: string | null;
    patronymic?: string | null;
    role_id?: number | null;
  };
}

/**
 * Middleware для проверки аутентификации
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация',
      });
    }

    const token = authHeader.substring(7); // Убираем "Bearer "

    // Проверяем токен
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Неверный или истёкший токен',
      });
    }

    // Проверяем существование пользователя
    const user = await UserModel.findById(payload.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден',
      });
    }

    // Добавляем данные пользователя в запрос
    req.user = {
      ...payload,
      role: user.role,
      name: user.name,
      surname: user.surname,
      patronymic: user.patronymic,
      role_id: user.role_id,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка аутентификации',
    });
  }
}

/**
 * Middleware для проверки роли администратора
 */
export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Требуется авторизация',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Доступ запрещён. Требуются права администратора',
    });
  }

  next();
}

/**
 * Опциональная аутентификация (не блокирует запрос, если нет токена)
 */
export async function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);

      if (payload) {
        const user = await UserModel.findById(payload.userId);
        if (user) {
          req.user = {
            ...payload,
            name: user.name,
            surname: user.surname,
            patronymic: user.patronymic,
          };
        }
      }
    }

    next();
  } catch (error) {
    // Просто продолжаем без пользователя
    next();
  }
}
