import { Router } from 'express';
import { ExpertController } from '../controllers/expert-controller';
import { authMiddleware } from '../middleware/auth';
import { expertMiddleware } from '../middleware/auth';

const router = Router();

/**
 * Маршруты для экспертов
 * Все маршруты требуют аутентификации и роли эксперта
 */

// Middleware для всех маршрутов
router.use(authMiddleware);
router.use(expertMiddleware);

// Профиль эксперта
router.get('/expert/profile', ExpertController.profile);

// Список заявок эксперта
router.get('/expert/applications', ExpertController.getApplications);

// Детальный просмотр заявки
router.get('/expert/applications/:id', ExpertController.getApplicationDetail);

// Вынесение вердикта
router.post('/expert/applications/:id/verdict', ExpertController.submitVerdict);

export default router;
