import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import path from 'path';
import fs from 'fs';
import { ReviewStatus } from '@prisma/client';

// Базовая папка для файлов заявок
const APPLICATION_FILES_DIR = path.join(__dirname, '..', '..', 'uploads', 'applications');

// Убедимся, что базовая папка существует
if (!fs.existsSync(APPLICATION_FILES_DIR)) {
  fs.mkdirSync(APPLICATION_FILES_DIR, { recursive: true });
}

/**
 * Создать путь к папке для файлов заявки
 * Формат: .id_конкурса\id_заявки+id_заявителя+\
 */
function getApplicationFolderPath(tenderId: number, applicationId: number, ownerId: number): string {
  const folderName = `.${tenderId}\\${applicationId}+${ownerId}+`;
  return path.join(APPLICATION_FILES_DIR, folderName);
}

/**
 * Создать папку для заявки, если она не существует
 */
function ensureApplicationFolderExists(tenderId: number, applicationId: number, ownerId: number): string {
  const folderPath = getApplicationFolderPath(tenderId, applicationId, ownerId);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  return folderPath;
}

/**
 * Сгенерировать уникальное имя файла
 */
function generateUniqueFilename(originalname: string): string {
  const timestamp = Date.now();
  const ext = path.extname(originalname);
  const basename = path.basename(originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
  return `${timestamp}_${basename}${ext}`;
}

/**
 * Контроллер для управления файлами заявок
 */
export class ApplicationFilesController {

  /**
   * Загрузить файл для заявки
   * POST /api/applications/:applicationId/files
   * Тело: multipart/form-data с файлом и комментарием
   */
  static async uploadFile(req: AuthRequest, res: Response) {
    try {
      const applicationId = parseInt(req.params.applicationId);
      if (isNaN(applicationId)) {
        return res.status(400).json({ success: false, message: 'Некорректный ID заявки' });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, message: 'Файл не загружен' });
      }

      // Получаем информацию о заявке
      const application = await prisma.applications.findUnique({
        where: { id: applicationId, deleted_at: null },
        select: { id: true, tender_id: true, owner_id: true },
      });

      if (!application) {
        return res.status(404).json({ success: false, message: 'Заявка не найдена' });
      }

      // Проверяем права доступа (только владелец или админ может загружать файлы)
      if (req.user?.userId !== application.owner_id && req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Нет прав для загрузки файлов' });
      }

      // Создаём папку для заявки
      const folderPath = ensureApplicationFolderExists(
        application.tender_id || 0,
        application.id,
        application.owner_id || 0
      );

      // Генерируем уникальное имя файла
      const diskFileName = generateUniqueFilename(file.originalname);
      const fullPath = path.join(folderPath, diskFileName);

      // Сохраняем файл на диск
      fs.writeFileSync(fullPath, file.buffer);

      // Получаем относительный путь для хранения в БД
      const relativePath = path.relative(APPLICATION_FILES_DIR, fullPath).replace(/\\/g, '/');

      // Создаём запись в БД
      const { comment } = req.body;

      const newFile = await prisma.additional_materials.create({
        data: {
          application_id: applicationId,
          file_path: relativePath,
          file_name: file.originalname,
          file_type: file.mimetype || null,
          file_bytes_size: file.size / (1024 * 1024), // в МБ
          comment: comment || null,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Файл успешно загружен',
        data: newFile,
      });
    } catch (error) {
      console.error('Error uploading application file:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при загрузке файла заявки',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Получить список файлов для заявки
   * GET /api/applications/:applicationId/files
   */
  static async getFiles(req: AuthRequest, res: Response) {
    try {
      const applicationId = parseInt(req.params.applicationId);
      if (isNaN(applicationId)) {
        return res.status(400).json({ success: false, message: 'Некорректный ID заявки' });
      }

      // Проверяем существование заявки
      const application = await prisma.applications.findUnique({
        where: { id: applicationId, deleted_at: null },
        select: { id: true, owner_id: true },
      });

      if (!application) {
        return res.status(404).json({ success: false, message: 'Заявка не найдена' });
      }

      // Получаем файлы заявки
      const files = await prisma.additional_materials.findMany({
        where: { application_id: applicationId, deleted_at: null },
        orderBy: { uploaded_at: 'desc' },
      });

      res.json({
        success: true,
        data: files,
      });
    } catch (error) {
      console.error('Error fetching application files:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении файлов заявки',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Скачать файл заявки
   * GET /api/applications/:applicationId/files/:fileId/download
   */
  static async downloadFile(req: AuthRequest, res: Response) {
    try {
      const applicationId = parseInt(req.params.applicationId);
      const fileId = parseInt(req.params.fileId);

      if (isNaN(applicationId) || isNaN(fileId)) {
        return res.status(400).json({ success: false, message: 'Некорректные ID' });
      }

      // Получаем информацию о файле
      const fileRecord = await prisma.additional_materials.findUnique({
        where: { id: fileId, deleted_at: null },
      });

      if (!fileRecord) {
        return res.status(404).json({ success: false, message: 'Файл не найден' });
      }

      // Проверяем, что файл принадлежит указанной заявке
      if (fileRecord.application_id !== applicationId) {
        return res.status(404).json({ success: false, message: 'Файл не найден' });
      }

      // Получаем полный путь к файлу
      const fullPath = path.join(APPLICATION_FILES_DIR, fileRecord.file_path.replace(/\//g, path.sep));

      // Проверяем существование файла
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ success: false, message: 'Файл не найден на сервере' });
      }

      // Отправляем файл
      res.download(fullPath, fileRecord.file_name);
    } catch (error) {
      console.error('Error downloading application file:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при скачивании файла заявки',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Удалить файл заявки
   * DELETE /api/applications/:applicationId/files/:fileId
   */
  static async deleteFile(req: AuthRequest, res: Response) {
    try {
      const applicationId = parseInt(req.params.applicationId);
      const fileId = parseInt(req.params.fileId);

      if (isNaN(applicationId) || isNaN(fileId)) {
        return res.status(400).json({ success: false, message: 'Некорректные ID' });
      }

      // Получаем информацию о файле
      const fileRecord = await prisma.additional_materials.findUnique({
        where: { id: fileId, deleted_at: null },
      });

      if (!fileRecord) {
        return res.status(404).json({ success: false, message: 'Файл не найден' });
      }

      // Проверяем, что файл принадлежит указанной заявке
      if (fileRecord.application_id !== applicationId) {
        return res.status(404).json({ success: false, message: 'Файл не найден' });
      }

      // Получаем полный путь к файлу
      const fullPath = path.join(APPLICATION_FILES_DIR, fileRecord.file_path.replace(/\//g, path.sep));

      // Удаляем файл с диска
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }

      // Мягкое удаление записи из БД
      await prisma.additional_materials.update({
        where: { id: fileId },
        data: { deleted_at: new Date() },
      });

      res.json({
        success: true,
        message: 'Файл удалён',
      });
    } catch (error) {
      console.error('Error deleting application file:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении файла заявки',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  /**
   * Получить информацию о файле
   * GET /api/applications/:applicationId/files/:fileId
   */
  static async getFileInfo(req: AuthRequest, res: Response) {
    try {
      const applicationId = parseInt(req.params.applicationId);
      const fileId = parseInt(req.params.fileId);

      if (isNaN(applicationId) || isNaN(fileId)) {
        return res.status(400).json({ success: false, message: 'Некорректные ID' });
      }

      const fileRecord = await prisma.additional_materials.findUnique({
        where: { id: fileId, deleted_at: null },
      });

      if (!fileRecord) {
        return res.status(404).json({ success: false, message: 'Файл не найден' });
      }

      if (fileRecord.application_id !== applicationId) {
        return res.status(404).json({ success: false, message: 'Файл не найден' });
      }

      res.json({
        success: true,
        data: fileRecord,
      });
    } catch (error) {
      console.error('Error fetching application file info:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении информации о файле',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }
}
