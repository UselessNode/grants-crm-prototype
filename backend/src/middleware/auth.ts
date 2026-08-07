import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { verifyToken, TokenPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Требуется авторизация' });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ success: false, message: 'Неверный или истёкший токен' });
    }

    // СВЕРХБЫСТРАЯ проверка: существует ли пользователь и не удалён ли он.
    // Мы не тянем все поля, только id.
    const userExists = await prisma.users.findUnique({
      where: { id: payload.userId, deleted_at: null },
      select: { id: true }
    });

    if (!userExists) {
      return res.status(401).json({ success: false, message: 'Пользователь не найден или удалён' });
    }

    // Если всё ок, прикрепляем payload (в котором уже есть role, email и т.д.)
    req.user = payload;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, message: 'Ошибка аутентификации' });
  }
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user?.role || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Доступ запрещён. Требуются права администратора' });
  }
  next();
}

export function expertMiddleware(req: AuthRequest, res: Response, next: NextFunction) {

  if (!req.user?.role || req.user.role !== 'expert') {
    return res.status(403).json({ success: false, message: 'Доступ запрещён. Требуются права эксперта' });
  }
  next();
}

export function requireRole(role: 'user' | 'admin' | 'expert') {
  return function (req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user?.role || req.user.role !== role) {
      return res.status(403).json({ success: false, message: `Доступ запрещён. Требуются права ${role}` });
    }
    next();
  };
}

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
        // Проверяем, что пользователь жив, но не блокируем запрос, если нет
        const userExists = await prisma.users.findUnique({
          where: { id: payload.userId, deleted_at: null },
          select: { id: true, name: true, surname: true, patronymic: true }
        });

        if (userExists) {
          req.user = {
            ...payload,
          };
        }
      }
    }
    next(); // Всегда идём дальше, даже если токена нет или он невалиден
  } catch (error) {
    next(); // Игнорируем ошибки в опциональной авторизации
  }
}
