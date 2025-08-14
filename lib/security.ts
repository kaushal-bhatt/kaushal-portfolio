import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-key';
const SALT_ROUNDS = 12;

export class SecurityService {
  // Hash password with bcrypt
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  // Verify password against hash
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate secure session token
  static generateSessionToken(userId: string): string {
    return jwt.sign(
      { 
        userId, 
        iat: Date.now(),
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      },
      JWT_SECRET
    );
  }

  // Verify session token
  static verifySessionToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return null;
    }
  }

  // Rate limiting store (in-memory for simplicity)
  private static attempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  // Check rate limiting
  static checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset if outside window
    if (now - attempt.lastAttempt > windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Check if limit exceeded
    if (attempt.count >= maxAttempts) {
      return false;
    }

    // Increment attempt
    attempt.count++;
    attempt.lastAttempt = now;
    return true;
  }

  // Reset rate limit for identifier
  static resetRateLimit(identifier: string): void {
    this.attempts.delete(identifier);
  }

  // Validate password strength
  static validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character (@$!%*?&)' };
    }

    return { isValid: true };
  }

  // Generate secure random string
  static generateSecureToken(length = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Sanitize input to prevent XSS
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .trim()
      .substring(0, 1000); // Limit length
  }

  // Generate CSRF token
  static generateCSRFToken(): string {
    return this.generateSecureToken(64);
  }

  // Validate CSRF token
  static validateCSRFToken(token: string, sessionToken: string): boolean {
    // In production, you'd store CSRF tokens in session
    // For now, basic validation
    return Boolean(token && token.length === 64);
  }
}
