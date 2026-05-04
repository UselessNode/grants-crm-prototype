import { Request, Response } from 'express';
import { DocumentModel, type Document, type DocumentCategory } from '../models/document';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';
import path from 'path';
import fs from 'fs';

// Базовая папка для загрузки файлов
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'documents');
const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'uploads', 'templates');

// Убедимся что папки существуют
[UPLOADS_DIR, TEMPLATES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Контроллер для управления документами
 */
export class DocumentController {
  /**
   * Получить список документов
   * GET /api/documents
   */
  static async getDocuments(req: AuthRequest, res: Response) {
    try {
      const { page, limit, category_id, is_template, template_type } = req.query;

      // Проверка и валидация параметров
      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 20;
      const categoryId = category_id && !isNaN(parseInt(category_id as string, 10))
        ? parseInt(category_id as string, 10)
        : undefined;

      const result = await DocumentModel.findAll({
        page: isNaN(pageNum) ? 1 : pageNum,
        limit: isNaN(limitNum) ? 20 : limitNum,
        category_id: categoryId,
        is_template: is_template === 'true',
        template_type: template_type as string | undefined,
      });

      res.json({
        success: true,
        ...result,
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
   * Получить документ по ID (с бинарными данными для скачивания)
   * GET /api/documents/:id/download
   */
  static async downloadDocument(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const document = await DocumentModel.findById(parseInt(id));

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Документ не найден',
        });
      }

      // Определяем путь к файлу
      if (!document.file_path) {
        return res.status(404).json({
          success: false,
          message: 'Путь к файлу не указан',
        });
      }

      const filePath = document.is_template
        ? path.join(TEMPLATES_DIR, document.file_path)
        : path.join(UPLOADS_DIR, document.file_path);

      // Проверяем существование файла
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Файл не найден на сервере',
        });
      }

      // Увеличиваем счётчик скачиваний
      await DocumentModel.incrementDownloadCount(parseInt(id));

      // Отправляем файл
      res.download(filePath, document.file_name);
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
   * Получить документ по ID (без бинарных данных)
   * GET /api/documents/:id
   */
  static async getDocument(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const document = await DocumentModel.findByIdLite(parseInt(id));

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Документ не найден',
        });
      }

      res.json({
        success: true,
        data: document,
      });
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
   */
  static async createDocument(req: AuthRequest, res: Response) {
    const client = await pool.connect();
    try {
      const {
        title,
        description,
        category_id,
        is_template,
        template_type,
      } = req.body;

      // Проверка наличия файла
      if (!req.file) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Файл не загружен',
        });
      }

      // Валидация
      if (!title) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Название документа обязательно',
        });
      }

      // Проверка размера файла (макс 10 МБ)
      const maxSize = 10 * 1024 * 1024; // 10 MB
      if (req.file.size > maxSize) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Размер файла не должен превышать 10 МБ',
        });
      }

      // Генерируем уникальное имя файла
      const timestamp = Date.now();
      const ext = path.extname(req.file.originalname);
      const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}${ext}`;

      // Определяем папку (шаблон или обычный документ)
      const isTemplate = is_template === 'true' || false;
      const targetDir = isTemplate ? TEMPLATES_DIR : UPLOADS_DIR;
      const filePath = path.join(targetDir, fileName);

      // Сохраняем файл на диск
      fs.writeFileSync(filePath, req.file.buffer);

      const document = await DocumentModel.create({
        title,
        description: description || null,
        category_id: category_id ? parseInt(category_id) : null,
        file_path: fileName,
        file_name: req.file.originalname,
        file_type: req.file.mimetype,
        file_size: req.file.size,
        is_template: isTemplate,
        template_type: template_type || null,
        created_by: req.user?.userId,
      });

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Документ успешно загружен',
        data: document,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating document:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при загрузке документа',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    } finally {
      client.release();
    }
  }

  /**
   * Обновить документ (метаданные)
   * PUT /api/documents/:id
   */
  static async updateDocument(req: AuthRequest, res: Response) {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const { title, description, category_id, is_template, template_type } = req.body;

      await client.query('BEGIN');

      const document = await DocumentModel.update(parseInt(id), {
        title,
        description,
        category_id,
        is_template,
        template_type,
      });

      if (!document) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Документ не найден',
        });
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Документ успешно обновлён',
        data: document,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating document:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении документа',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    } finally {
      client.release();
    }
  }

  /**
   * Заменить файл документа
   * PUT /api/documents/:id/file
   */
  static async updateDocumentFile(req: AuthRequest, res: Response) {
    const client = await pool.connect();
    try {
      const { id } = req.params;

      // Проверка наличия файла
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Файл не загружен',
        });
      }

      await client.query('BEGIN');

      // Проверка размера файла (макс 10 МБ)
      const maxSize = 10 * 1024 * 1024; // 10 MB
      if (req.file.size > maxSize) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Размер файла не должен превышать 10 МБ',
        });
      }

      // Получаем текущий документ для удаления старого файла
      const currentDoc = await DocumentModel.findById(parseInt(id));

      if (!currentDoc) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Документ не найден',
        });
      }

      // Генерируем уникальное имя файла
      const timestamp = Date.now();
      const ext = path.extname(req.file.originalname);
      const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}${ext}`;

      // Определяем папку
      const targetDir = currentDoc.is_template ? TEMPLATES_DIR : UPLOADS_DIR;
      const filePath = path.join(targetDir, fileName);

      // Сохраняем новый файл
      fs.writeFileSync(filePath, req.file.buffer);

      // Удаляем старый файл
      if (currentDoc.file_path) {
        const oldPath = path.join(targetDir, currentDoc.file_path);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const document = await DocumentModel.updateFile(parseInt(id), {
        file_path: fileName,
        file_name: req.file.originalname,
        file_type: req.file.mimetype,
        file_size: req.file.size,
      });

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Файл документа успешно обновлён',
        data: document,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating document file:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении файла документа',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    } finally {
      client.release();
    }
  }

  /**
   * Удалить документ
   * DELETE /api/documents/:id
   */
  static async deleteDocument(req: AuthRequest, res: Response) {
    const client = await pool.connect();
    try {
      const { id } = req.params;

      await client.query('BEGIN');

      // Получаем документ для удаления файла
      const doc = await DocumentModel.findById(parseInt(id));

      if (!doc) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Документ не найден',
        });
      }

      // Удаляем файл с диска
      if (doc.file_path) {
        const targetDir = doc.is_template ? TEMPLATES_DIR : UPLOADS_DIR;
        const filePath = path.join(targetDir, doc.file_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Удаляем запись из БД
      const deleted = await DocumentModel.delete(parseInt(id));

      if (!deleted) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Документ не найден',
        });
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Документ успешно удалён',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting document:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении документа',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    } finally {
      client.release();
    }
  }

  /**
   * Получить категории документов
   * GET /api/documents/categories
   */
  static async getCategories(req: AuthRequest, res: Response) {
    try {
      const categories = await DocumentModel.getCategories();

      res.json({
        success: true,
        data: categories,
      });
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
   * Создать категорию документов
   * POST /api/documents/categories
   */
  static async createCategory(req: AuthRequest, res: Response) {
    const client = await pool.connect();
    try {
      const { name, description, sort_order } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Название категории обязательно',
        });
      }

      await client.query('BEGIN');

      const category = await DocumentModel.createCategory({
        name,
        description,
        sort_order,
      });

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Категория успешно создана',
        data: category,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при создании категории',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    } finally {
      client.release();
    }
  }

  /**
   * Обновить категорию документов
   * PUT /api/documents/categories/:id
   */
  static async updateCategory(req: AuthRequest, res: Response) {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const { name, description, sort_order } = req.body;

      await client.query('BEGIN');

      const category = await DocumentModel.updateCategory(parseInt(id), {
        name,
        description,
        sort_order,
      });

      if (!category) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Категория не найдена',
        });
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Категория успешно обновлена',
        data: category,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating category:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении категории',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    } finally {
      client.release();
    }
  }

  /**
   * Удалить категорию документов
   * DELETE /api/documents/categories/:id
   */
  static async deleteCategory(req: AuthRequest, res: Response) {
    const client = await pool.connect();
    try {
      const { id } = req.params;

      await client.query('BEGIN');

      // Проверяем, есть ли документы в этой категории
      const docsCheck = await client.query(
        'SELECT COUNT(*) FROM documents WHERE category_id = $1',
        [parseInt(id)]
      );

      const docsCount = parseInt(docsCheck.rows[0].count);

      if (docsCount > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Нельзя удалить категорию: в ней находится ${docsCount} документ(ов)`,
        });
      }

      const deleted = await DocumentModel.deleteCategory(parseInt(id));

      if (!deleted) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Категория не найдена',
        });
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Категория успешно удалена',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении категории',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    } finally {
      client.release();
    }
  }

  /**
   * Получить шаблоны согласий
   * GET /api/documents/templates/:type
   */
  static async getTemplates(req: AuthRequest, res: Response) {
    try {
      const { type } = req.params;

      const templates = await DocumentModel.getTemplatesByType(type);

      res.json({
        success: true,
        data: templates,
      });
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
