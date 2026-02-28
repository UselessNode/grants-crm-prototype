import pool from '../config/database';

/**
 * Интерфейс пользователя
 */
export interface User {
  id?: number;
  email: string;
  surname?: string | null;
  name?: string | null;
  patronymic?: string | null;
  full_name?: string | null;
  role: 'user' | 'admin';
  last_activity?: Date;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Интерфейс для регистрации пользователя
 */
export interface UserCreateData {
  email: string;
  password: string;
  surname?: string | null;
  name?: string | null;
  patronymic?: string | null;
  role?: 'user' | 'admin';
}

/**
 * Интерфейс для обновления пользователя
 */
export interface UserUpdateData {
  surname?: string | null;
  name?: string | null;
  patronymic?: string | null;
  full_name?: string | null;
  role?: 'user' | 'admin';
  last_activity?: Date;
}

/**
 * Класс для работы с пользователями
 */
export class UserModel {
  /**
   * Найти пользователя по email
   */
  static async findByEmail(email: string): Promise<(User & { password_hash?: string }) | null> {
    try {
      const result = await pool.query(`
        SELECT * FROM users WHERE email = $1
      `, [email]);

      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database connection error in findByEmail:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Найти пользователя по ID
   */
  static async findById(id: number): Promise<User | null> {
    try {
      const result = await pool.query(`
        SELECT id, email, surname, name, patronymic, full_name, role, last_activity, created_at, updated_at
        FROM users
        WHERE id = $1
      `, [id]);

      return result.rows[0] || null;
    } catch (error) {
      console.warn('Database connection error in findById:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Создать нового пользователя
   */
  static async create(data: UserCreateData): Promise<User | null> {
    const client = await pool.connect();
    try {
      const { email, password, surname, name, patronymic, role = 'user' } = data;

      // Проверяем, существует ли уже пользователь с таким email
      const existing = await this.findByEmail(email);
      if (existing) {
        throw new Error('Пользователь с таким email уже существует');
      }

      const result = await client.query(`
        INSERT INTO users (email, password_hash, surname, name, patronymic, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, surname, name, patronymic, full_name, role, created_at, updated_at
      `, [email, password, surname || null, name || null, patronymic || null, role]);

      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Обновить пользователя
   */
  static async update(id: number, data: UserUpdateData): Promise<User | null> {
    const client = await pool.connect();
    try {
      const fields: string[] = [];
      const values: (string | number | Date | null)[] = [];
      let paramIndex = 1;

      const allowedFields: (keyof UserUpdateData)[] = [
        'surname', 'name', 'patronymic', 'full_name', 'role', 'last_activity'
      ];

      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          fields.push(`${field} = $${paramIndex}`);
          values.push(data[field] as string | number | Date | null);
          paramIndex++;
        }
      }

      if (fields.length === 0) {
        return await this.findById(id);
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await client.query(`
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, email, surname, name, patronymic, full_name, role, last_activity, created_at, updated_at
      `, values);

      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  /**
   * Обновить время последней активности
   */
  static async updateLastActivity(id: number): Promise<boolean> {
    try {
      await pool.query(`
        UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE id = $1
      `, [id]);
      return true;
    } catch (error) {
      console.warn('Database connection error in updateLastActivity:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Получить всех пользователей с пагинацией
   */
  static async findAll(options: { page?: number; limit?: number } = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      // Получаем общее количество записей
      const countResult = await pool.query(`
        SELECT COUNT(*) as total FROM users
      `);
      const total = parseInt(countResult.rows[0].total);

      // Получаем данные с пагинацией
      const dataResult = await pool.query(`
        SELECT id, email, surname, name, patronymic, full_name, role, last_activity, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

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
      console.warn('Database connection error in findAll:', error instanceof Error ? error.message : 'Unknown error');
      return {
        data: [],
        pagination: {
          page: options.page || 1,
          limit: options.limit || 10,
          total: 0,
          pages: 0,
        },
      };
    }
  }

  /**
   * Удалить пользователя
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.warn('Database connection error in delete:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }
}
