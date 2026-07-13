import pool from '../config/database';
import {
  AdditionalMaterial,
  AdditionalMaterialCreateData,
  AdditionalMaterialWithApplication,
  FileCategory,
  FileInfo,
} from './types';

// Ре-экспорт типов для использования в других модулях
export type { FileCategory, FileInfo };

/**
 * Модель для работы с дополнительными материалами
 */
export class AdditionalMaterialModel {
  /**
   * Получить все дополнительные материалы для заявки
   */
  static async findByApplication(applicationId: number): Promise<AdditionalMaterialWithApplication[]> {
    try {
      const result = await pool.query(
        `SELECT am.*, a.title as application_title
         FROM additional_materials am
         LEFT JOIN applications a ON am.application_id = a.id
         WHERE am.application_id = $1 AND am.deleted_at IS NULL
         ORDER BY am.file_name`,
        [applicationId]
      );
      return result.rows;
    } catch (error) {
      console.warn('Database error in findByApplication:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Получить дополнительный материал по ID
   */
  static async findById(id: number): Promise<AdditionalMaterial | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM additional_materials WHERE id = $1 AND deleted_at IS NULL',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database error in findById:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Создать дополнительный материал
   */
  static async create(
    data: AdditionalMaterialCreateData,
    applicationId: number
  ): Promise<AdditionalMaterial> {
    try {
      const result = await pool.query(`
        INSERT INTO additional_materials (
          application_id, file_path, file_name, file_type, file_bytes_size, comment
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        applicationId,
        data.file_path,
        data.file_name,
        data.file_type || null,
        data.file_bytes_size || null,
        data.comment || null,
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Создать несколько дополнительных материалов
   */
  static async createMany(
    materials: AdditionalMaterialCreateData[],
    applicationId: number
  ): Promise<AdditionalMaterial[]> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const createdMaterials: AdditionalMaterial[] = [];
      for (const material of materials) {
        const result = await client.query(`
          INSERT INTO additional_materials (
            application_id, file_path, file_name, file_type, file_bytes_size, comment
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [
          applicationId,
          material.file_path,
          material.file_name,
          material.file_type || null,
          material.file_bytes_size || null,
          material.comment || null,
        ]);
        createdMaterials.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return createdMaterials;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Обновить дополнительный материал
   */
  static async update(
    id: number,
    data: Partial<AdditionalMaterialCreateData>
  ): Promise<AdditionalMaterial | null> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    let paramIndex = 1;

    if (data.file_path !== undefined) {
      fields.push(`file_path = $${paramIndex++}`);
      values.push(data.file_path);
    }

    if (data.file_name !== undefined) {
      fields.push(`file_name = $${paramIndex++}`);
      values.push(data.file_name);
    }

    if (data.file_type !== undefined) {
      fields.push(`file_type = $${paramIndex++}`);
      values.push(data.file_type);
    }

    if (data.file_bytes_size !== undefined) {
      fields.push(`file_bytes_size = $${paramIndex++}`);
      values.push(data.file_bytes_size);
    }

    if (data.comment !== undefined) {
      fields.push(`comment = $${paramIndex++}`);
      values.push(data.comment);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    try {
      const result = await pool.query(`
        UPDATE additional_materials
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, values);
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database error in update:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Удалить дополнительный материал (мягкое удаление)
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'UPDATE additional_materials SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database error in delete:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Удалить все дополнительные материалы для заявки
   */
  static async deleteByApplication(applicationId: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'UPDATE additional_materials SET deleted_at = CURRENT_TIMESTAMP WHERE application_id = $1',
        [applicationId]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database error in deleteByApplication:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Заменить все дополнительные материалы для заявки
   */
  static async replaceForApplication(
    applicationId: number,
    materials: AdditionalMaterialCreateData[]
  ): Promise<AdditionalMaterial[]> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Удаляем старые материалы
      await client.query('DELETE FROM additional_materials WHERE application_id = $1', [applicationId]);

      // Добавляем новые материалы
      const createdMaterials: AdditionalMaterial[] = [];
      for (const material of materials) {
        const result = await client.query(`
          INSERT INTO additional_materials (
            application_id, file_path, file_name, file_type, file_bytes_size, comment
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [
          applicationId,
          material.file_path,
          material.file_name,
          material.file_type || null,
          material.file_bytes_size || null,
          material.comment || null,
        ]);
        createdMaterials.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return createdMaterials;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== Категории файлов ====================

  /**
   * Получить все категории файлов
   */
  static async getFileCategories(): Promise<FileCategory[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM file_categories WHERE deleted_at IS NULL ORDER BY name'
      );
      return result.rows;
    } catch (error) {
      console.warn('Database error in getFileCategories:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Получить категорию файлов по ID
   */
  static async getFileCategoryById(id: number): Promise<FileCategory | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM file_categories WHERE id = $1 AND deleted_at IS NULL',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database error in getFileCategoryById:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Создать категорию файлов
   */
  static async createFileCategory(data: {
    name: string;
    description?: string | null;
  }): Promise<FileCategory> {
    try {
      const result = await pool.query(`
        INSERT INTO file_categories (name, description)
        VALUES ($1, $2)
        RETURNING *
      `, [data.name, data.description || null]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Обновить категорию файлов
   */
  static async updateCategory(
    id: number,
    data: { name?: string; description?: string | null }
  ): Promise<FileCategory | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(data.name);
      }
      if (data.description !== undefined) {
        fields.push(`description = $${paramIndex++}`);
        values.push(data.description);
      }

      if (fields.length === 0) {
        return this.getFileCategoryById(id);
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await pool.query(`
        UPDATE file_categories
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, values);
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database error in updateCategory:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Удалить категорию файлов
   */
  static async deleteCategory(id: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'UPDATE file_categories SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database error in deleteCategory:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  // ==================== Файлы (общая таблица) ====================

  /**
   * Получить все файлы
   */
  static async findAllFiles(params?: {
    page?: number;
    limit?: number;
    category_id?: number;
    search?: string;
  }): Promise<{ data: FileInfo[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    let conditions: string[] = [];
    let values: any[] = [];
    let paramIndex = 1;

    if (params?.category_id) {
      conditions.push(`f.category_id = $${paramIndex++}`);
      values.push(params.category_id);
    }

    if (params?.search) {
      conditions.push(`(f.name ILIKE $${paramIndex} OR f.file_type ILIKE $${paramIndex})`);
      values.push(`%${params.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
      // Общее количество
      const countResult = await pool.query(
        `SELECT COUNT(*) as total FROM files f ${whereClause}`,
        values
      );
      const total = parseInt(countResult.rows[0].total);

      // Данные
      const dataResult = await pool.query(`
        SELECT
          f.id,
          f.name,
          f.description,
          f.category_id,
          fc.name as category_name,
          f.file_path,
          f.file_type,
          f.file_bytes_size,
          f.created_by,
          f.created_at,
          f.updated_at
        FROM files f
        LEFT JOIN file_categories fc ON f.category_id = fc.id
        ${whereClause}
        ORDER BY f.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, [...values, limit, offset]);

      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.warn('Database error in findAllFiles:', error instanceof Error ? error.message : 'Unknown error');
      return {
        data: [],
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          total: 0,
          pages: 0,
        },
      };
    }
  }

  /**
   *учить файл по ID
   */
  static async getFileById(id: number): Promise<FileInfo | null> {
    try {
      const result = await pool.query(`
        SELECT
          f.id,
          f.name,
          f.description,
          f.category_id,
          fc.name as category_name,
          f.file_path,
          f.file_type,
          f.file_bytes_size,
          f.created_by,
          f.created_at,
          f.updated_at
        FROM files f
        LEFT JOIN file_categories fc ON f.category_id = fc.id
        WHERE f.id = $1
      `, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database error in getFileById:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Создать файл
   */
  static async createFile(data: {
    name: string;
    description?: string | null;
    category_id?: number | null;
    file_path: string;
    file_type: string;
    file_bytes_size: number;
    created_by?: number | null;
  }): Promise<FileInfo> {
    try {
      const result = await pool.query(`
        INSERT INTO files (
          name, description, category_id, file_path, file_type, file_bytes_size, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        data.name,
        data.description || null,
        data.category_id || null,
        data.file_path,
        data.file_type,
        data.file_bytes_size,
        data.created_by || null,
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Удалить файл
   */
  static async deleteFile(id: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'UPDATE files SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database error in deleteFile:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }
}
