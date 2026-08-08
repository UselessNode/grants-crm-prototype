import { Router } from 'express';
import { ApplicationFilesController } from '../controllers/application-files-controller';
import { authMiddleware } from '../middleware/auth';
import multer from 'multer';

const router = Router();

// Настройка multer для загрузки файлов
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 МБ
  },
});

/**
 * Маршруты для работы с файлами заявок
 * Все маршруты требуют аутентификации
 */
router.use(authMiddleware);

// Загрузка файла для заявки
router.post('/applications/:applicationId/files', upload.single('file'), ApplicationFilesController.uploadFile);

// Получение списка файлов заявки
router.get('/applications/:applicationId/files', ApplicationFilesController.getFiles);

// Получение информации о файле
router.get('/applications/:applicationId/files/:fileId', ApplicationFilesController.getFileInfo);

// Скачивание файла
router.get('/applications/:applicationId/files/:fileId/download', ApplicationFilesController.downloadFile);

// Удаление файла
router.delete('/applications/:applicationId/files/:fileId', ApplicationFilesController.deleteFile);

export default router;
