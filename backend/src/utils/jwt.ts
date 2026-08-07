import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: number;
  email: string;
  role: 'user' | 'admin' | 'expert';
  role_id?: number | null;
  name?: string | null;
  surname?: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRATION = '7d';
const SESSION_WARNING_TIME = 25 * 60; // 25 минут в секундах

export function generateToken(data: {
  id: number;
  email: string;
  role: string;
  role_id?: number | null;
}): string {
  const payload: TokenPayload = {
    userId: data.id,
    email: data.email,
    role: data.role as 'user' | 'admin' | 'expert',
    role_id: data.role_id,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    // Любая ошибка валидации (истёк, подделан) = null
    return null;
  }
}

export function getTokenRemainingTime(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded || !decoded.exp) return null;

    const now = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - now;
    return remaining > 0 ? remaining : 0;
  } catch {
    return null;
  }
}

export function shouldShowSessionWarning(token: string): boolean {
  const remaining = getTokenRemainingTime(token);
  if (remaining === null) return false;
  return remaining <= SESSION_WARNING_TIME && remaining > 0;
}

export function getTimeUntilSessionWarning(token: string): number | null {
  const remaining = getTokenRemainingTime(token);
  if (remaining === null) return null;
  if (remaining <= SESSION_WARNING_TIME) return 0;
  return (remaining - SESSION_WARNING_TIME) * 1000;
}

export { JWT_SECRET };
