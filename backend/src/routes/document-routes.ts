import { Router } from 'express';
import { DocumentController } from '../controllers/document-controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import multer from 'multer';

const router = Router();

// Настраиваем multer для хранения файлов в памяти (для записи в БД)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    // Разрешаем только PDF и изображения
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только файлы PDF, JPG, PNG'));
    }
  },
});

/**
 * Маршруты для управления документами
 */

// Публичные маршруты (доступны всем авторизованным пользователям)
// ВАЖНО: Сначала специфичные маршруты, потом общие с параметрами
router.get('/documents', authMiddleware, DocumentController.getDocuments);
router.get('/documents/categories', authMiddleware, DocumentController.getCategories);
router.get('/documents/templates/:type', authMiddleware, DocumentController.getTemplates);
router.get('/documents/:id', authMiddleware, DocumentController.getDocument);
router.get('/documents/:id/download', authMiddleware, DocumentController.downloadDocument);

// Маршруты только для администраторов
router.post(
  '/documents',
  authMiddleware,
  adminMiddleware,
  upload.single('file'),
  DocumentController.createDocument
);

router.put(
  '/documents/:id',
  authMiddleware,
  adminMiddleware,
  DocumentController.updateDocument
);

router.put(
  '/documents/:id/file',
  authMiddleware,
  adminMiddleware,
  upload.single('file'),
  DocumentController.updateDocumentFile
);

router.delete('/documents/:id', authMiddleware, adminMiddleware, DocumentController.deleteDocument);

// Категории (только администраторы)
router.post(
  '/documents/categories',
  authMiddleware,
  adminMiddleware,
  DocumentController.createCategory
);

router.put(
  '/documents/categories/:id',
  authMiddleware,
  adminMiddleware,
  DocumentController.updateCategory
);

router.delete(
  '/documents/categories/:id',
  authMiddleware,
  adminMiddleware,
  DocumentController.deleteCategory
);

export default router;
