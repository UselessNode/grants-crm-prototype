import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserModel, UserCreateData } from '../models/User';
import { generateToken, verifyToken, getTokenRemainingTime } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

/**
 * Контроллер для управления аутентификацией
 */
export class AuthController {
  /**
   * Регистрация нового пользователя
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, password, surname, name, patronymic } = req.body;

      // Валидация обязательных полей
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email и пароль обязательны',
          errors: {
            email: !email ? 'Email обязателен' : null,
            password: !password ? 'Пароль обязателен' : null,
          },
        });
      }

      // Валидация email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Некорректный формат email',
          errors: {
            email: 'Введите корректный email',
          },
        });
      }

      // Валидация пароля (минимум 6 символов)
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Пароль должен содержать минимум 6 символов',
          errors: {
            password: 'Пароль должен содержать минимум 6 символов',
          },
        });
      }

      // Хеширование пароля
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Создание пользователя
      const userData: UserCreateData = {
        email,
        password: passwordHash,
        surname: surname || null,
        name: name || null,
        patronymic: patronymic || null,
        role: 'user',
      };

      const user = await UserModel.create(userData);

      if (!user) {
        return res.status(500).json({
          success: false,
          message: 'Ошибка при создании пользователя',
        });
      }

      // Генерируем токен
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        data: {
          user: {
            id: user.id,
            email: user.email,
            surname: user.surname,
            name: user.name,
            patronymic: user.patronymic,
            full_name: user.full_name,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Error registering user:', error);

      if (error instanceof Error && error.message === 'Пользователь с таким email уже существует') {
        return res.status(409).json({
          success: false,
          message: 'Пользователь с таким email уже существует',
          errors: {
            email: 'Такой email уже зарегистрирован',
          },
        });
      }

      res.status(500).json({
        success: false,
        message: 'Ошибка при регистрации',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Вход пользователя (логин)
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Валидация обязательных полей
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email и пароль обязательны',
          errors: {
            email: !email ? 'Email обязателен' : null,
            password: !password ? 'Пароль обязателен' : null,
          },
        });
      }

      // Поиск пользователя
      const user = await UserModel.findByEmail(email);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Неверный email или пароль',
        });
      }

      // Проверка пароля
      const passwordMatch = await bcrypt.compare(password, user.password_hash!);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Неверный email или пароль',
        });
      }

      // Генерируем токен
      const token = generateToken(user);

      // Обновляем время последней активности
      await UserModel.updateLastActivity(user.id!);

      res.json({
        success: true,
        message: 'Успешный вход',
        data: {
          user: {
            id: user.id,
            email: user.email,
            surname: user.surname,
            name: user.name,
            patronymic: user.patronymic,
            full_name: user.full_name,
            role: user.role,
          },
          token,
        },
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

  /**
   * Получить текущий профиль пользователя
   * GET /api/auth/me
   */
  static async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Требуется авторизация',
        });
      }

      const user = await UserModel.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден',
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          surname: user.surname,
          name: user.name,
          patronymic: user.patronymic,
          full_name: user.full_name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении профиля',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Проверка токена (валидация сессии)
   * GET /api/auth/verify
   */
  static async verify(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Требуется авторизация',
        });
      }

      // Получаем токен из заголовка
      const authHeader = req.headers.authorization;
      const token = authHeader?.substring(7);

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Токен не предоставлен',
        });
      }

      // Проверяем оставшееся время
      const remainingTime = getTokenRemainingTime(token);

      res.json({
        success: true,
        data: {
          valid: true,
          remainingTime,
          user: {
            id: req.user.userId,
            email: req.user.email,
            role: req.user.role,
          },
        },
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при проверке токена',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Обновить профиль пользователя
   * PUT /api/auth/profile
   */
  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Требуется авторизация',
        });
      }

      const { surname, name, patronymic } = req.body;

      const updatedUser = await UserModel.update(req.user.userId, {
        surname,
        name,
        patronymic,
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден',
        });
      }

      res.json({
        success: true,
        message: 'Профиль успешно обновлён',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          surname: updatedUser.surname,
          name: updatedUser.name,
          patronymic: updatedUser.patronymic,
          full_name: updatedUser.full_name,
          role: updatedUser.role,
        },
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении профиля',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }
}
