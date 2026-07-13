import pool from '../config/database';

/**
 * Интерфейс роли
 */
export interface Role {
  id: number;
  name: 'user' | 'admin' | 'expert';
  description?: string | null;
  created_at?: Date;
}

/**
 * Интерфейс пользователя (без пароля)
 */
export interface User {
  id: number;
  email: string;
  surname?: string | null;
  name?: string | null;
  patronymic?: string | null;
  role: 'user' | 'admin' | 'expert';
  role_id: number;
  last_activity?: Date;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Данные для аутентификации (с паролем)
 */
export interface AuthUser {
  id: number;
  email: string;
  password_hash: string;
  role_id: number;
}

/**
 * Данные для создания пользователя
 */
export interface UserCreateData {
  email: string;
  passwordHash: string; // уже захешированный пароль
  surname?: string | null;
  name?: string | null;
  patronymic?: string | null;
  role?: 'user' | 'admin' | 'expert';
}

/**
 * Данные для обновления пользователя
 */
export interface UserUpdateData {
  surname?: string | null;
  name?: string | null;
  patronymic?: string | null;
  role?: 'user' | 'admin' | 'expert';
  last_activity?: Date;
}

/**
 * Класс для работы с пользователями
 */
export class UserModel {
  /**
   * Найти пользователя для аутентификации (с паролем)
   */
  static async findByEmailForAuth(email: string): Promise<AuthUser | null> {
    const result = await pool.query(
      `SELECT id, email, password_hash, role_id
       FROM users
       WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * Найти пользователя по ID (без пароля)
   */
  static async findById(id: number): Promise<User | null> {
    const result = await pool.query(
      `SELECT u.id, u.email, u.surname, u.name, u.patronymic,
              COALESCE(r.name, 'user') as role, u.role_id,
              u.last_activity, u.created_at, u.updated_at
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Найти пользователя по email (без пароля)
   */
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT u.id, u.email, u.surname, u.name, u.patronymic,
              COALESCE(r.name, 'user') as role, u.role_id,
              u.last_activity, u.created_at, u.updated_at
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1 AND u.deleted_at IS NULL`,
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * Создать нового пользователя
   */
  static async create(data: UserCreateData): Promise<User> {
    const { email, passwordHash, surname, name, patronymic, role = 'user' } = data;

    // Получаем role_id по названию роли
    const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [role]);
    const roleId = roleResult.rows[0]?.id || 1;

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, surname, name, patronymic, role_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, surname, name, patronymic, role_id, created_at, updated_at`,
      [email, passwordHash, surname || null, name || null, patronymic || null, roleId]
    );

    const row = result.rows[0];
    return {
      ...row,
      role: role,
    };
  }

  /**
   * Обновить пользователя
   */
  static async update(id: number, data: UserUpdateData): Promise<User | null> {
    const fields: string[] = [];
    const values: (string | number | Date | null)[] = [];
    let paramIndex = 1;

    // Разрешённые поля для обновления
    const allowedFields: (keyof UserUpdateData)[] = [
      'surname', 'name', 'patronymic', 'last_activity'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(data[field] as string | number | Date | null);
        paramIndex++;
      }
    }

    // Обновление роли
    if (data.role !== undefined) {
      const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [data.role]);
      const roleId = roleResult.rows[0]?.id || 1;
      fields.push(`role_id = $${paramIndex}`);
      values.push(roleId);
      paramIndex++;
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex} AND deleted_at IS NULL
       RETURNING id, email, surname, name, patronymic, role_id, last_activity, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    // Добавляем поле role для удобства
    const roleResult = await pool.query('SELECT name FROM roles WHERE id = $1', [row.role_id]);
    return {
      ...row,
      role: roleResult.rows[0]?.name || 'user',
    };
  }

  /**
   * Обновить время последней активности
   */
  static async updateLastActivity(id: number): Promise<void> {
    await pool.query(
      `UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
  }

  /**
   * Получить всех пользователей с пагинацией
   */
  static async findAll(options: { page?: number; limit?: number } = {}): Promise<{
    data: User[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    // Общее количество
    const countResult = await pool.query('SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL');
    const total = parseInt(countResult.rows[0].total);

    // Данные с пагинацией
    const dataResult = await pool.query(
      `SELECT u.id, u.email, u.surname, u.name, u.patronymic,
              COALESCE(r.name, 'user') as role, u.role_id,
              u.last_activity, u.created_at, u.updated_at
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.deleted_at IS NULL
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

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
   * Мягкое удаление пользователя (установка deleted_at)
   */
  static async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      `UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Получить все роли
   */
  static async getRoles(): Promise<Role[]> {
    const result = await pool.query('SELECT * FROM roles ORDER BY id');
    return result.rows;
  }
}
