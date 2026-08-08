import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { Prisma } from '../generated/prisma/client'; // Для типизации ошибок Prisma
import { generateToken, getTokenRemainingTime } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

// Хелпер для очистки данных пользователя перед отправкой клиенту
const sanitizeUser = (user: any) => {
  const { password_hash, ...sanitized } = user;
  return {
    ...sanitized,
    role: user.roles?.name || 'user',
  };
};

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, surname, name, patronymic, consent } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email и пароль обязательны',
          errors: { email: !email ? 'Email обязателен' : null, password: !password ? 'Пароль обязателен' : null },
        });
      }

      // Проверка согласия на обработку персональных данных
      if (!consent) {
        return res.status(400).json({
          success: false,
          message: 'Необходимо дать согласие на обработку персональных данных',
          errors: { consent: 'Необходимо дать согласие на обработку персональных данных' },
        });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Некорректный формат email', errors: { email: 'Введите корректный email' } });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Пароль должен содержать минимум 6 символов', errors: { password: 'Пароль слишком короткий' } });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Prisma сама проверит уникальность email благодаря @unique в схеме
      const user = await prisma.users.create({
        data: {
          email,
          password_hash: passwordHash,
          surname: surname || null,
          name: name || null,
          patronymic: patronymic || null,
          role_id: 1, // По умолчанию 'user' (id=1 в таблице roles)
        },
        include: { roles: true },
      });

      const token = generateToken({ id: user.id, email: user.email, role: user.roles?.name || 'user' });

      res.status(201).json({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        data: { user: sanitizeUser(user), token },
      });
    } catch (error) {
      // P2002 - это код ошибки Prisma при нарушении уникального ограничения (Unique constraint failed)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Пользователь с таким email уже существует',
          errors: { email: 'Такой email уже зарегистрирован' },
        });
      }

      console.error('Error registering user:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при регистрации',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email и пароль обязательны'
        });
      }

      // ОДИН запрос вместо двух. Сразу тянем роль.
      const user = await prisma.users.findFirst({
        where: { email, deleted_at: null },
        include: { roles: true },
      });

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({
          success: false,
          message: 'Неверный email или пароль'
        });
      }

      // Обновляем активность асинхронно, не блокируя ответ
      prisma.users.update({
        where: { id: user.id },
        data: { last_activity: new Date() },
      }).catch(console.error);

      const token = generateToken({ id: user.id, email: user.email, role: user.roles?.name || 'user' });

      res.json({
        success: true,
        message: 'Успешный вход',
        data: { user: sanitizeUser(user), token },
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при входе',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  static async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Требуется авторизация' });

      const user = await prisma.users.findUnique({
        where: { id: req.user.userId, deleted_at: null },
        include: { roles: true },
      });

      if (!user) return res.status(404).json({ success: false, message: 'Пользователь не найден' });

      res.json({ success: true, data: sanitizeUser(user) });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ success: false, message: 'Ошибка при получении профиля' });
    }
  }

  static async verify(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Требуется авторизация' });

      const authHeader = req.headers.authorization;
      const token = authHeader?.substring(7);

      if (!token) return res.status(401).json({ success: false, message: 'Токен не предоставлен' });

      res.json({
        success: true,
        data: {
          valid: true,
          remainingTime: getTokenRemainingTime(token),
          user: { id: req.user.userId, email: req.user.email, role: req.user.role },
        },
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(500).json({ success: false, message: 'Ошибка при проверке токена' });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Требуется авторизация' });

      const { surname, name, patronymic } = req.body;

      const updatedUser = await prisma.users.update({
        where: { id: req.user.userId, deleted_at: null },
        data: {
          surname: surname ?? undefined, // ?? undefined говорит Prisma не трогать поле, если оно не передано
          name: name ?? undefined,
          patronymic: patronymic ?? undefined,
          updated_at: new Date(),
        },
        include: { roles: true },
      });

      res.json({
        success: true,
        message: 'Профиль успешно обновлён',
        data: sanitizeUser(updatedUser),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ success: false, message: 'Ошибка при обновлении профиля' });
    }
  }
}
