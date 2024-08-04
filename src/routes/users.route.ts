import { Router } from 'express';
import { CreateUserSchema, UpdateUserSchema } from '@schemas/user.schema';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { UserController } from '@/controllers/user.controller';

export class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, AuthMiddleware, this.userController.getUsers);
    this.router.get(`${this.path}/:id`, AuthMiddleware, this.userController.getUserById);
    this.router.post(`${this.path}`, AuthMiddleware, ValidationMiddleware(CreateUserSchema), this.userController.createUser);
    this.router.put(`${this.path}/:id`, AuthMiddleware, ValidationMiddleware(UpdateUserSchema), this.userController.updateUser);
    this.router.delete(`${this.path}/:id`, AuthMiddleware, this.userController.deleteUser);
  }
}
