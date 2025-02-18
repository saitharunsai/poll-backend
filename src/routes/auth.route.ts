import { Router } from 'express';
import { AuthController } from '@controllers/auth.controller';
import { CreateUserSchema, LoginSchema } from '@schemas/user.schema';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

export class AuthRoute implements Routes {
  public path = '/auth';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/signup`,
      ValidationMiddleware(CreateUserSchema),
      this.authController.signUp,
    );
    this.router.post(
      `${this.path}/login`,
      ValidationMiddleware(LoginSchema),
      this.authController.logIn,
    );
    this.router.post(`${this.path}/logout`, AuthMiddleware, this.authController.logOut);
    this.router.post(`${this.path}/refresh-token`, this.authController.refreshToken);
  }
}
