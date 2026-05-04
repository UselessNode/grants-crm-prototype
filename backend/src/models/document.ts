import pool from '../config/database';

/**
 * Интерфейс для документа
 */
export interface Document {
  id?: number;
  title: string;
  description?: string | null;
  category_id?: number | null;
  category_name?: string | null;
  file_path?: string; // Путь к файлу на сервере
  file_name: string;
  file_type: string;
  file_size: number;
  is_template?: boolean;
  template_type?: string | null;
  download_count?: number;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Интерфейс для категории документов
 */
export interface DocumentCategory {
  id: number;
  name: string;
  description?: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Модель для работы с документами
 */
export class DocumentModel {
  /**
   * Получить все документы с категориями
   */
  static async findAll(params?: {
    page?: number;
    limit?: number;
    category_id?: number;
    is_template?: boolean;
    template_type?: string;
  }): Promise<{ data: Document[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    // Гарантируем числовые значения
    const page = (params?.page !== undefined && !isNaN(Number(params.page))) ? Number(params.page) : 1;
    const limit = (params?.limit !== undefined && !isNaN(Number(params.limit))) ? Number(params.limit) : 20;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params?.category_id !== undefined && params?.category_id !== null) {
      conditions.push(`d.category_id = $${paramIndex++}`);
      values.push(Number(params.category_id));
    }

    if (params?.is_template !== undefined) {
      conditions.push(`d.is_template = $${paramIndex++}`);
      values.push(params.is_template);
    }

    if (params?.template_type) {
      conditions.push(`d.template_type = $${paramIndex++}`);
      values.push(params.template_type);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Получаем общее количество
    const countQuery = `
      SELECT COUNT(*)
      FROM documents d
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Получаем документы
    const dataQuery = `
      SELECT
        d.id,
        d.title,
        d.description,
        d.category_id,
        dc.name as category_name,
        d.file_path,
        d.file_name,
        d.file_type,
        d.file_size,
        d.is_template,
        d.template_type,
        d.download_count,
        d.created_by,
        d.created_at,
        d.updated_at
      FROM documents d
      LEFT JOIN document_categories dc ON d.category_id = dc.id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    const dataResult = await pool.query(dataQuery, [...values, limit, offset]);

    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить документ по ID
   */
  static async findById(id: number): Promise<Document | null> {
    const result = await pool.query(
      `
      SELECT
        d.id,
        d.title,
        d.description,
        d.category_id,
        dc.name as category_name,
        d.file_path,
        d.file_name,
        d.file_type,
        d.file_size,
        d.is_template,
        d.template_type,
        d.download_count,
        d.created_by,
        d.created_at,
        d.updated_at
      FROM documents d
      LEFT JOIN document_categories dc ON d.category_id = dc.id
      WHERE d.id = $1
    `,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Получить документ по ID без бинарных данных (для списков)
   */
  static async findByIdLite(id: number): Promise<Document | null> {
    const result = await pool.query(
      `
      SELECT
        d.id,
        d.title,
        d.description,
        d.category_id,
        dc.name as category_name,
        d.file_name,
        d.file_type,
        d.file_size,
        d.is_template,
        d.template_type,
        d.download_count,
        d.created_by,
        d.created_at,
        d.updated_at
      FROM documents d
      LEFT JOIN document_categories dc ON d.category_id = dc.id
      WHERE d.id = $1
    `,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Создать документ
   */
  static async create(data: {
    title: string;
    description?: string | null;
    category_id?: number | null;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    is_template?: boolean;
    template_type?: string | null;
    created_by?: number | null;
  }): Promise<Document> {
    const result = await pool.query(
      `
      INSERT INTO documents (
        title, description, category_id, file_path, file_name, file_type,
        file_size, is_template, template_type, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `,
      [
        data.title,
        data.description || null,
        data.category_id || null,
        data.file_path,
        data.file_name,
        data.file_type,
        data.file_size,
        data.is_template || false,
        data.template_type || null,
        data.created_by || null,
      ]
    );

    return result.rows[0];
  }

  /**
   * Обновить документ (без замены файла)
   */
  static async update(
    id: number,
    data: {
      title?: string;
      description?: string | null;
      category_id?: number | null;
      is_template?: boolean;
      template_type?: string | null;
    }
  ): Promise<Document | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }

    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }

    if (data.category_id !== undefined) {
      fields.push(`category_id = $${paramIndex++}`);
      values.push(data.category_id);
    }

    if (data.is_template !== undefined) {
      fields.push(`is_template = $${paramIndex++}`);
      values.push(data.is_template);
    }

    if (data.template_type !== undefined) {
      fields.push(`template_type = $${paramIndex++}`);
      values.push(data.template_type);
    }

    if (fields.length === 0) {
      return this.findByIdLite(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `
      UPDATE documents
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Обновить файл документа
   */
  static async updateFile(
    id: number,
    data: {
      file_path: string;
      file_name: string;
      file_type: string;
      file_size: number;
    }
  ): Promise<Document | null> {
    const result = await pool.query(
      `
      UPDATE documents
      SET
        file_path = $1,
        file_name = $2,
        file_type = $3,
        file_size = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `,
      [data.file_path, data.file_name, data.file_type, data.file_size, id]
    );

    return result.rows[0] || null;
  }

  /**
   * Удалить документ
   */
  static async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM documents WHERE id = $1 RETURNING id',
      [id]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Увеличить счётчик скачиваний
   */
  static async incrementDownloadCount(id: number): Promise<void> {
    await pool.query(
      `
      UPDATE documents
      SET download_count = download_count + 1
      WHERE id = $1
    `,
      [id]
    );
  }

  /**
   * Получить все категории документов
   */
  static async getCategories(): Promise<DocumentCategory[]> {
    const result = await pool.query(
      `
      SELECT *
      FROM document_categories
      ORDER BY sort_order, name
    `
    );

    return result.rows;
  }

  /**
   * Получить категорию по ID
   */
  static async getCategoryById(id: number): Promise<DocumentCategory | null> {
    const result = await pool.query(
      'SELECT * FROM document_categories WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Создать категорию документов
   */
  static async createCategory(data: {
    name: string;
    description?: string | null;
    sort_order?: number;
  }): Promise<DocumentCategory> {
    const result = await pool.query(
      `
      INSERT INTO document_categories (name, description, sort_order)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [data.name, data.description || null, data.sort_order || 0]
    );

    return result.rows[0];
  }

  /**
   * Обновить категорию документов
   */
  static async updateCategory(
    id: number,
    data: {
      name?: string;
      description?: string | null;
      sort_order?: number;
    }
  ): Promise<DocumentCategory | null> {
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

    if (data.sort_order !== undefined) {
      fields.push(`sort_order = $${paramIndex++}`);
      values.push(data.sort_order);
    }

    if (fields.length === 0) {
      return this.getCategoryById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `
      UPDATE document_categories
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Удалить категорию документов
   */
  static async deleteCategory(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM document_categories WHERE id = $1 RETURNING id',
      [id]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Получить шаблоны документов по типу
   */
  static async getTemplatesByType(templateType: string): Promise<Document[]> {
    const result = await pool.query(
      `
      SELECT
        d.id,
        d.title,
        d.description,
        d.category_id,
        dc.name as category_name,
        d.file_name,
        d.file_type,
        d.file_size,
        d.is_template,
        d.template_type,
        d.download_count,
        d.created_by,
        d.created_at,
        d.updated_at
      FROM documents d
      LEFT JOIN document_categories dc ON d.category_id = dc.id
      WHERE d.is_template = true AND d.template_type = $1
      ORDER BY d.created_at DESC
    `,
      [templateType]
    );

    return result.rows;
  }
}
