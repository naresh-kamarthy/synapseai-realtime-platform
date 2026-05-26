import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './database';
import { User } from '../src/types';
import { registerSchema, loginSchema } from './validators';

// Helpers to get cryptographic keys
export function getJwtSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    console.error('CRITICAL ERROR: Environment variable JWT_ACCESS_SECRET/JWT_SECRET is not defined!');
    throw new Error('JWT_ACCESS_SECRET environment variable is required for cryptographic security.');
  }
  return secret;
}

export function getJwtRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    console.error('CRITICAL ERROR: Environment variable JWT_REFRESH_SECRET/JWT_SECRET is not defined!');
    throw new Error('JWT_REFRESH_SECRET environment variable is required for cryptographic security.');
  }
  return secret;
}

// Helpers to generate IDs
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Custom request interface with user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Token generation helpers
export function generateAccessToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    getJwtSecret(),
    { expiresIn: '15m' }
  );
}

// Alias generateToken as generateAccessToken to preserve backwards-compatibility where called
export function generateToken(user: User): string {
  return generateAccessToken(user);
}

export function generateRefreshToken(user: User): string {
  return jwt.sign(
    { id: user.id },
    getJwtRefreshSecret(),
    { expiresIn: '7d' }
  );
}

// Cookie configuration for high security HttpOnly Refresh Token
export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, // Always true to support safe Secure cookie handling inside iframes
  sameSite: 'none' as const, // Required for cross-origin iframe embedding in AI Studio preview
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// Middleware to authenticate user
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token = '';

    // Check Authorization Bearer headers
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { id: string; email: string; name: string; role: string };
    const user = await db.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User session invalid. Please log in again.' });
    }

    if (user.blocked) {
      return res.status(403).json({ error: 'Your account has been suspended by system administrators.' });
    }

    // Update user's lastActiveAt state asynchronously in Mongoose
    const { UserModel } = await import('./database');
    UserModel.findByIdAndUpdate(user.id, { lastActiveAt: new Date().toISOString() }).catch(() => {});

    req.user = user;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Access token has expired.' });
    }
    return res.status(401).json({ error: 'Session expired or token invalid.' });
  }
}

// Role-based authorization middleware
export function requireRole(role: 'user' | 'admin') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ error: `Requires role: ${role}` });
    }
    next();
  };
}

// adminOnly middleware for strictly validating standard admin access controls
export function adminOnly(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Access denied: Admin authentication required.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Administrator status required.' });
  }
  next();
}

// Controller registrations
export async function handleRegister(req: Request, res: Response) {
  try {
    // 1. Zod request validation
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      const firstErrorMessage = validationResult.error.issues[0]?.message || 'Validation failed';
      return res.status(400).json({
        success: false,
        message: firstErrorMessage
      });
    }

    const { name, email, password } = validationResult.data;

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Dynamic clean avatar letter
    const avatar = name.slice(0, 2).toUpperCase();

    const newUser: User = {
      id: generateUUID(),
      name,
      email: email.toLowerCase().trim(),
      avatar,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    const userObj = await db.createUser(newUser, passwordHash);

    // Tokens generation
    const accessToken = generateAccessToken(userObj);
    const refreshToken = generateRefreshToken(userObj);

    // Save refresh token in DB
    const { UserModel } = await import('./database');
    await UserModel.findByIdAndUpdate(userObj.id, { refreshToken }).catch(() => {});

    // Set refresh token in HttpOnly Cookie
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    // Write audit log entry for registration
    await db.logAudit(userObj.id, userObj.name, userObj.email, 'REGISTER', 'User account created successfully and logged in.', undefined, req.ip);

    return res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: userObj.id,
        name: userObj.name,
        email: userObj.email,
        avatar: userObj.avatar,
        role: userObj.role,
      },
      token: accessToken,
    });
  } catch (e: any) {
    console.error('Registration error:', e);
    return res.status(500).json({ error: 'Internal server registration error' });
  }
}

export async function handleLogin(req: Request, res: Response) {
  try {
    // 1. Zod request validation
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      const firstErrorMessage = validationResult.error.issues[0]?.message || 'Validation failed';
      return res.status(400).json({
        success: false,
        message: firstErrorMessage
      });
    }

    const { email, password } = validationResult.data;

    const user = await db.getUserByEmail(email);
    if (!user) {
      await db.logAudit(undefined, undefined, email, 'FAILED_AUTH', `Failed login attempt with invalid email: ${email}`, undefined, req.ip);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (user.blocked) {
      await db.logAudit(user.id, user.name, user.email, 'FAILED_AUTH', 'Blocked user account attempted authentication.', undefined, req.ip);
      return res.status(403).json({ error: 'Your account has been suspended by system administrators.' });
    }

    const hash = await db.getPasswordHash(user.id);
    if (!hash) {
      return res.status(400).json({ error: 'User credentials database records missing' });
    }

    const isMatch = await bcrypt.compare(password, hash);
    if (!isMatch) {
      await db.logAudit(user.id, user.name, user.email, 'FAILED_AUTH', 'Failed login attempt: incorrect password.', undefined, req.ip);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Refresh user's lastActiveAt state in DB
    const { UserModel } = await import('./database');
    await UserModel.findByIdAndUpdate(user.id, { lastActiveAt: new Date().toISOString() }).catch(() => {});

    // Tokens generation
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token in DB
    await UserModel.findByIdAndUpdate(user.id, { refreshToken }).catch(() => {});

    // Set refresh token in HttpOnly Cookie
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    // Write audit log entry for login
    await db.logAudit(user.id, user.name, user.email, 'LOGIN', 'Authenticated session established successfully.', undefined, req.ip);

    return res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      token: accessToken,
    });
  } catch (e: any) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'Internal server login error' });
  }
}

export async function handleRefresh(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, getJwtRefreshSecret());
    } catch (verifyErr) {
      return res.status(401).json({ error: 'Session expired. Invalid refresh token.' });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Invalid refresh token payload.' });
    }

    const user = await db.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User session invalid. Please log in again.' });
    }

    if (user.blocked) {
      return res.status(403).json({ error: 'Your account has been suspended by system administrators.' });
    }

    // Verify token matches what's stored in MongoDB for security, detecting reuse/theft
    const { UserModel } = await import('./database');
    const userDoc = await UserModel.findById(user.id);
    if (!userDoc || userDoc.refreshToken !== refreshToken) {
      // Refresh token mismatch trigger: possible theft/hijack. Invalidate user refreshes!
      if (userDoc) {
        userDoc.refreshToken = null;
        await userDoc.save();
      }
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
      });
      return res.status(401).json({ error: 'Session revoked due to token conflict. Please authenticate again.' });
    }

    // Rotate refresh token securely
    const nextAccessToken = generateAccessToken(user);
    const nextRefreshToken = generateRefreshToken(user);

    userDoc.refreshToken = nextRefreshToken;
    await userDoc.save();

    // Re-set updated cookie
    res.cookie('refreshToken', nextRefreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      message: 'Token renewed successfully',
      token: nextAccessToken,
      accessToken: nextAccessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Token refreshing sequence error:', err);
    return res.status(500).json({ error: 'Failed to negotiate token rotation.' });
  }
}

export async function handleLogout(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const { UserModel } = await import('./database');
      await UserModel.findOneAndUpdate({ refreshToken }, { refreshToken: null }).catch(() => {});
    }
  } catch (err) {
    console.warn('Logout database record traces exception:', err);
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
  });
  return res.status(200).json({ message: 'Logged out successfully' });
}

export function verifyCurrentUser(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.status(200).json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role,
    },
  });
}

