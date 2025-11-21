// src/middlewares/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UnauthorizedError from '../errors/UnauthorizedError';

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  try {
    const payload = jwt.verify(token, 'super-strong-secret') as { _id: string };

    req.user = payload;
    return next();
  } catch (err) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
};
