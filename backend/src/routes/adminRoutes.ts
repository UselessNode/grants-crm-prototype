import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

/**
 * Маршруты админ-панели
 * Все маршруты требуют аутентификации и прав администратора
 */

// Middleware для всех маршрутов
router.use(authMiddleware);
router.use(adminMiddleware);

// Статистика
router.get('/admin/stats', AdminController.stats);

// Пользователи
router.get('/admin/users', AdminController.getUsers);

// Заявки (все)
router.get('/admin/applications', AdminController.getApplications);

// Направления
router.get('/admin/directions', AdminController.getDirections);

// Тендеры (конкурсы)
router.get('/admin/tenders', AdminController.getTenders);

// Эксперты
router.get('/admin/experts', AdminController.getExperts);
router.put('/admin/applications/:id/experts', AdminController.assignExperts);
router.get('/admin/applications/:id/verdicts', AdminController.getVerdicts);

export default router;
