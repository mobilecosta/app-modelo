import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  sistema?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token de autenticacao nao fornecido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string; sistema?: string };
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.sistema = decoded.sistema;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalido ou expirado' });
  }
};
