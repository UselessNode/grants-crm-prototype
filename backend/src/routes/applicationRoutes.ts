import { Router } from 'express';
import { ApplicationController } from '../controllers/ApplicationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * Маршруты для управления заявками
 * Все маршруты требуют аутентификации
 */

// Middleware для всех маршрутов
router.use(authMiddleware);

// Получить список ролей (только для администраторов)
router.get('/roles', ApplicationController.getRoles);

// Получить список заявок (с пагинацией, поиском и фильтрацией)
router.get('/applications', ApplicationController.index);

// Получить направления
router.get('/directions', ApplicationController.getDirections);

// Получить статусы
router.get('/statuses', ApplicationController.getStatuses);

// Получить тендеры
router.get('/tenders', ApplicationController.getTenders);

// Получить заявку по ID
router.get('/applications/:id', ApplicationController.show);

// Создать новую заявку
router.post('/applications', ApplicationController.create);

// Обновить заявку
router.put('/applications/:id', ApplicationController.update);

// Удалить заявку
router.delete('/applications/:id', ApplicationController.delete);

// Подать заявку
router.post('/applications/:id/submit', ApplicationController.submit);

// Выставить вердикт эксперта
router.post('/applications/:id/verdict', ApplicationController.addVerdict);

// Получить заявки, назначенные эксперту
router.get('/expert/:id/applications', ApplicationController.getExpertApplications);

export default router;
