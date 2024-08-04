import { NextFunction, Request, Response } from 'express';
import { CreateUserDto, LoginDto } from '@schemas/user.schema';
import { AuthService } from '@services/auth.service';

export class AuthController {
  public authService = new AuthService();

  public signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const { user, accessToken, refreshToken } = await this.authService.signup(userData);

      res.status(201).json({ data: { user, accessToken, refreshToken }, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: LoginDto = req.body;
      const { user, accessToken, refreshToken } = await this.authService.login(userData);

      res.status(200).json({ data: { user, accessToken, refreshToken }, message: 'login' });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.id;
      await this.authService.logout(userId);

      res.status(200).json({ message: 'logout' });
    } catch (error) {
      next(error);
    }
  };

  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refreshToken(refreshToken);

      res.status(200).json({ data: tokens, message: 'token refreshed' });
    } catch (error) {
      next(error);
    }
  };
}