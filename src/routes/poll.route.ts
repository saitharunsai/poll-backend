import { Router } from 'express';
import { PollController } from '@controllers/poll.controller';
import {
  CreatePollValidationSchema,
  UpdatePollValidationSchema,
  CreateAnswerValidationSchema,
  StartPollSchema,
} from '@schemas/poll.schema';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { RoleMiddleware } from '@middlewares/role.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

export class PollRoute implements Routes {
  public path = '/polls';
  public router = Router();
  public pollController = new PollController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/create`,
      AuthMiddleware,
      RoleMiddleware(['TEACHER']),
      ValidationMiddleware(CreatePollValidationSchema),
      this.pollController.createPoll,
    );

    this.router.get(`${this.path}`, AuthMiddleware, this.pollController.getAllPolls);

    this.router.put(
      `${this.path}/list/:id`,
      AuthMiddleware,
      RoleMiddleware(['TEACHER']),
      ValidationMiddleware(UpdatePollValidationSchema),
      this.pollController.updatePoll,
    );

    this.router.delete(
      `${this.path}/delete/:id`,
      AuthMiddleware,
      RoleMiddleware(['TEACHER']),
      this.pollController.deletePoll,
    );

    this.router.post(
      `${this.path}/start`,
      AuthMiddleware,
      RoleMiddleware(['TEACHER']),
      ValidationMiddleware(StartPollSchema),
      this.pollController.startPoll,
    );
    this.router.post(
      `${this.path}/end`,
      AuthMiddleware,
      RoleMiddleware(['TEACHER']),
      ValidationMiddleware(StartPollSchema),
      this.pollController.endPoll,
    );
    this.router.post(
      `${this.path}/answer`,
      AuthMiddleware,
      ValidationMiddleware(CreateAnswerValidationSchema),
      this.pollController.submitAnswer,
    );
    this.router.get(`${this.path}/:id`, AuthMiddleware, this.pollController.getPoll);

    this.router.get(
      `${this.path}/active`,
      AuthMiddleware,
      RoleMiddleware(['TEACHER']),
      this.pollController.getActivePoll,
    );

    this.router.get(`${this.path}/:id/results`, AuthMiddleware, this.pollController.getPollResults);
  }
}
