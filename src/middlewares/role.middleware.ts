import { NextFunction, Response } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';

export const RoleMiddleware = (allowedRoles: string[]) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { role } = req.user;

      if (allowedRoles.includes(role)) {
        next();
      } else {
        next(new HttpException(403, 'You do not have permission to perform this action'));
      }
    } catch (error) {
      next(new HttpException(401, 'Authentication failed'));
    }
  };
};
