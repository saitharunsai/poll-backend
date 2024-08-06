import { NextFunction, Request, Response } from 'express';
import { z, ZodSchema } from 'zod';
import { HttpException } from '@/exceptions/HttpException';


/**
 * @name ValidationMiddleware
 * @description Allows use of decorator and non-decorator based validation
 * @param schema Zod schema
 */
export const ValidationMiddleware = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate the request body
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      if (e instanceof z.ZodError) {
        // Extract validation errors and format the message
        const message = e.errors.map(error => error.message).join(', ');
        next(new HttpException(400, message));
      } else {
        next(e);
      }
    }
  };
};
