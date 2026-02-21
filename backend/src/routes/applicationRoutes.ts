import { Router } from 'express';
import { ApplicationController } from '../controllers/ApplicationController';

const router = Router();

/**
 * Маршруты для управления заявками
 */

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

export default router;
