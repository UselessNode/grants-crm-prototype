import { Router } from 'express';
import { AuthController } from '../controllers/auth-controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * Маршруты для аутентификации
 */

// Регистрация нового пользователя
router.post('/auth/register', AuthController.register);

// Вход пользователя
router.post('/auth/login', AuthController.login);

// Проверка токена (валидация сессии)
router.get('/auth/verify', authMiddleware, AuthController.verify);

// Получить текущий профиль пользователя
router.get('/auth/me', authMiddleware, AuthController.me);

// Обновить профиль пользователя
router.put('/auth/profile', authMiddleware, AuthController.updateProfile);

export default router;
