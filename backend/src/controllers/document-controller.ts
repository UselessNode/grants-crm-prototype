import { Request, Response } from 'express';
import { DocumentModel, type Document, type DocumentCategory } from '../models/document';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';

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

      // Увеличиваем счётчик скачиваний
      await DocumentModel.incrementDownloadCount(parseInt(id));

      // Устанавливаем заголовки для скачивания
      res.setHeader('Content-Type', document.file_type);
      res.setHeader('Content-Length', document.file_size);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(document.file_name)}"`
      );

      // Отправляем файл
      res.send(document.file_data);
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
      // Проверка прав администратора
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Требуются права администратора',
        });
      }

      await client.query('BEGIN');

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

      const document = await DocumentModel.create({
        title,
        description: description || null,
        category_id: category_id ? parseInt(category_id) : null,
        file_data: req.file.buffer,
        file_name: req.file.originalname,
        file_type: req.file.mimetype,
        file_size: req.file.size,
        is_template: is_template === 'true' || false,
        template_type: template_type || null,
        created_by: req.user.userId,
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
      // Проверка прав администратора
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Требуются права администратора',
        });
      }

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
      // Проверка прав администратора
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Требуются права администратора',
        });
      }

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

      const document = await DocumentModel.updateFile(parseInt(id), {
        file_data: req.file.buffer,
        file_name: req.file.originalname,
        file_type: req.file.mimetype,
        file_size: req.file.size,
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
      // Проверка прав администратора
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Требуются права администратора',
        });
      }

      const { id } = req.params;

      await client.query('BEGIN');

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
      // Проверка прав администратора
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Требуются права администратора',
        });
      }

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
      // Проверка прав администратора
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Требуются права администратора',
        });
      }

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
      // Проверка прав администратора
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещён. Требуются права администратора',
        });
      }

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
