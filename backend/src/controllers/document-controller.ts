import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database'; // Пути не меняй, они корректны
import path from 'path';
import fs from 'fs';

// Базовые папки для загрузки
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'documents');
const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'uploads', 'templates');

// Убедимся, что папки существуют
[UPLOADS_DIR, TEMPLATES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Контроллер для управления документами (Prisma)
 */
export class DocumentController {

  /**
   * Получить список документов с пагинацией и фильтрацией
   * GET /api/documents?page=1&limit=20&category_id=2&search=шаблон
   */
  static async getDocuments(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const categoryId = req.query.category_id ? parseInt(req.query.category_id as string) : undefined;
      const search = req.query.search as string | undefined;

      const skip = (page - 1) * limit;

      // Строим условия WHERE
      const where: any = {
        deleted_at: null,
      };
      if (categoryId && !isNaN(categoryId)) {
        where.category_id = categoryId;
      }
      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }

      // Получаем общее количество для пагинации
      const total = await prisma.files.count({ where });

      // Получаем файлы
      const files = await prisma.files.findMany({
        where,
        include: {
          file_categories: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      });

      res.json({
        success: true,
        data: files,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении документов',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Скачать файл по ID
   * GET /api/documents/:id/download
   */
  static async downloadDocument(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Некорректный ID' });
      }

      const file = await prisma.files.findUnique({
        where: { id, deleted_at: null },
      });

      if (!file) {
        return res.status(404).json({ success: false, message: 'Документ не найден' });
      }

      if (!file.path) {
        return res.status(404).json({ success: false, message: 'Путь к файлу не указан' });
      }

      // Определяем полный путь (файлы могут лежать в documents/ или templates/)
      const filePath = path.join(UPLOADS_DIR, file.path);
      // Проверяем, существует ли файл
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'Файл не найден на сервере' });
      }

      // Отправляем файл (используем оригинальное имя из БД)
      res.download(filePath, file.name);
    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при скачивании документа',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Получить метаданные документа по ID (без содержимого)
   * GET /api/documents/:id
   */
  static async getDocument(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Некорректный ID' });
      }

      const file = await prisma.files.findUnique({
        where: { id, deleted_at: null },
        include: { file_categories: true },
      });

      if (!file) {
        return res.status(404).json({ success: false, message: 'Документ не найден' });
      }

      res.json({ success: true, data: file });
    } catch (error) {
      console.error('Error fetching document:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении документа',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Загрузить новый документ
   * POST /api/documents
   * Тело: multipart/form-data с полями: file, title, description, category_id, is_template (boolean)
   */
  static async createDocument(req: AuthRequest, res: Response) {
    try {
      const { title, description, category_id, is_template } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, message: 'Файл не загружен' });
      }

      if (!title) {
        return res.status(400).json({ success: false, message: 'Название документа обязательно' });
      }

      // Проверка размера (10 МБ)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return res.status(400).json({ success: false, message: 'Размер файла не должен превышать 10 МБ' });
      }

      // Генерируем уникальное имя файла на диске
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const diskFileName = `${timestamp}_${Math.random().toString(36).substring(7)}${ext}`;

      // Определяем папку назначения (шаблоны или документы)
      const isTemplate = is_template === 'true' || is_template === true;
      const targetDir = isTemplate ? TEMPLATES_DIR : UPLOADS_DIR;
      const relativePath = isTemplate ? `templates/${diskFileName}` : `documents/${diskFileName}`;
      const fullPath = path.join(targetDir, diskFileName);

      // Сохраняем файл на диск
      fs.writeFileSync(fullPath, file.buffer);

      // Создаём запись в БД
      const newFile = await prisma.files.create({
        data: {
          name: title,
          description: description || null,
          file_type: file.mimetype || null,
          category_id: category_id ? parseInt(category_id) : null,
          path: relativePath,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Документ успешно загружен',
        data: newFile,
      });
    } catch (error) {
      console.error('Error creating document:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при загрузке документа',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Обновить метаданные документа (без замены файла)
   * PUT /api/documents/:id
   */
  static async updateDocument(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Некорректный ID' });
      }

      const { title, description, category_id } = req.body;

      // Проверяем существование документа
      const existing = await prisma.files.findUnique({
        where: { id, deleted_at: null },
      });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Документ не найден' });
      }

      const updated = await prisma.files.update({
        where: { id },
        data: {
          name: title || undefined,
          description: description || undefined,
          category_id: category_id ? parseInt(category_id) : undefined,
        },
      });

      res.json({
        success: true,
        message: 'Документ обновлён',
        data: updated,
      });
    } catch (error) {
      console.error('Error updating document:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении документа',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Заменить файл документа (новый бинарный файл)
   * PUT /api/documents/:id/file
   */
  static async updateDocumentFile(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Некорректный ID' });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, message: 'Файл не загружен' });
      }

      // Проверка размера
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return res.status(400).json({ success: false, message: 'Размер файла не должен превышать 10 МБ' });
      }

      // Получаем текущий документ
      const existing = await prisma.files.findUnique({
        where: { id, deleted_at: null },
      });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Документ не найден' });
      }

      // Удаляем старый файл с диска, если он существует
      if (existing.path) {
        const oldPath = path.join(UPLOADS_DIR, existing.path);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Генерируем новое имя файла
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const diskFileName = `${timestamp}_${Math.random().toString(36).substring(7)}${ext}`;

      // Определяем, был ли это шаблон (по наличию "templates/" в пути)
      const isTemplate = existing.path?.startsWith('templates/') || false;
      const targetDir = isTemplate ? TEMPLATES_DIR : UPLOADS_DIR;
      const relativePath = isTemplate ? `templates/${diskFileName}` : `documents/${diskFileName}`;
      const fullPath = path.join(targetDir, diskFileName);

      // Сохраняем новый файл
      fs.writeFileSync(fullPath, file.buffer);

      // Обновляем запись в БД
      const updated = await prisma.files.update({
        where: { id },
        data: {
          name: file.originalname, // можно обновить имя, но обычно оставляем старое
          file_type: file.mimetype || null,
          path: relativePath,
        },
      });

      res.json({
        success: true,
        message: 'Файл документа успешно заменён',
        data: updated,
      });
    } catch (error) {
      console.error('Error updating document file:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при замене файла',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Удалить документ (мягкое удаление + удаление файла с диска)
   * DELETE /api/documents/:id
   */
  static async deleteDocument(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Некорректный ID' });
      }

      // Получаем документ для удаления файла
      const existing = await prisma.files.findUnique({
        where: { id, deleted_at: null },
      });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Документ не найден' });
      }

      // Удаляем файл с диска
      if (existing.path) {
        const filePath = path.join(UPLOADS_DIR, existing.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Мягкое удаление (устанавливаем deleted_at)
      await prisma.files.update({
        where: { id },
        data: { deleted_at: new Date() },
      });

      res.json({
        success: true,
        message: 'Документ удалён',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении документа',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Получить список категорий документов
   * GET /api/documents/categories
   */
  static async getCategories(req: AuthRequest, res: Response) {
    try {
      const categories = await prisma.file_categories.findMany({
        where: { deleted_at: null },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении категорий',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Создать категорию
   * POST /api/documents/categories
   */
  static async createCategory(req: AuthRequest, res: Response) {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Название категории обязательно' });
      }

      const category = await prisma.file_categories.create({
        data: {
          name,
          description: description || null,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Категория создана',
        data: category,
      });
    } catch (error: any) {
      // Если имя уже существует, Prisma выбросит ошибку unique constraint
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          message: 'Категория с таким именем уже существует',
        });
      }
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при создании категории',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Обновить категорию
   * PUT /api/documents/categories/:id
   */
  static async updateCategory(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Некорректный ID' });
      }

      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Название категории обязательно' });
      }

      // Проверяем существование
      const existing = await prisma.file_categories.findUnique({
        where: { id, deleted_at: null },
      });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Категория не найдена' });
      }

      const updated = await prisma.file_categories.update({
        where: { id },
        data: { name, description },
      });

      res.json({
        success: true,
        message: 'Категория обновлена',
        data: updated,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          message: 'Категория с таким именем уже существует',
        });
      }
      console.error('Error updating category:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении категории',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Удалить категорию (только если в ней нет документов)
   * DELETE /api/documents/categories/:id
   */
  static async deleteCategory(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Некорректный ID' });
      }

      // Проверяем, есть ли файлы в этой категории
      const count = await prisma.files.count({
        where: { category_id: id, deleted_at: null },
      });

      if (count > 0) {
        return res.status(400).json({
          success: false,
          message: `Нельзя удалить категорию: в ней находится ${count} документ(ов)`,
        });
      }

      // Мягкое удаление категории
      await prisma.file_categories.update({
        where: { id },
        data: { deleted_at: new Date() },
      });

      res.json({
        success: true,
        message: 'Категория удалена',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении категории',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Получить шаблоны по типу (устаревший эндпоинт, можно заменить на фильтр по категории)
   * GET /api/documents/templates/:type
   */
  static async getTemplates(req: AuthRequest, res: Response) {
    try {
      const { type } = req.params;
      // В новой логике шаблоны — это файлы с определённой категорией или именем
      // Например, можно искать по имени, содержащему "шаблон" или по категории "Шаблоны"
      const templates = await prisma.files.findMany({
        where: {
          deleted_at: null,
          name: { contains: 'шаблон', mode: 'insensitive' },
          // или можно фильтровать по категории с id=2 (шаблоны)
          // category_id: 2,
        },
        include: { file_categories: true },
        orderBy: { created_at: 'desc' },
      });

      res.json({ success: true, data: templates });
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении шаблонов',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }
}
