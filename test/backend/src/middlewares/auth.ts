import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'store_rating_app_jwt_secret_key_987654321';

export interface UserPayload {
  id: number;
  email: string;
  role: 'ADMIN' | 'NORMAL' | 'STORE_OWNER';
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ status: 'fail', message: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ status: 'fail', message: 'Unauthorized: Invalid token' });
  }
};

export const requireRole = (allowedRoles: ('ADMIN' | 'NORMAL' | 'STORE_OWNER')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ status: 'fail', message: 'Unauthorized: Not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You do not have permission to access this resource',
      });
      return;
    }

    next();
  };
};
