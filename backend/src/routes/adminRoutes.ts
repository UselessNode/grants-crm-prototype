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
router.post('/admin/experts', AdminController.addExpert);
router.put('/admin/experts/:id', AdminController.updateExpert);
router.delete('/admin/experts/:id', AdminController.deleteExpert);

// Изменение статуса заявки
router.post('/admin/applications/:id/change-status', AdminController.changeStatus);

// Пользователи - редактирование и удаление
router.put('/admin/users/:id', AdminController.updateUser);
router.delete('/admin/users/:id', AdminController.deleteUser);

export default router;
