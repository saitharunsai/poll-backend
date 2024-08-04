import { NextFunction, Response } from 'express';
import { PollService } from '@services/poll.service';
import { CreatePollDto, UpdatePollDto, CreateAnswerDto, StartPollDto } from '@schemas/poll.schema';
import { RequestWithUser } from '@interfaces/auth.interface';

export class PollController {
  public pollService = new PollService();

  public createPoll = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const pollData: CreatePollDto = req.body;
      const createdPoll = await this.pollService.createPoll(pollData, req.user.id);
      res.status(201).json({ data: createdPoll, message: 'Poll created successfully' });
    } catch (error) {
      next(error);
    }
  };

  public getPoll = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const pollId = req.params.id;
      const poll = await this.pollService.getPoll(pollId);
      res.status(200).json({ data: poll, message: 'Poll retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };

  public updatePoll = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const pollId = req.params.id;
      const pollData: UpdatePollDto = req.body;
      const updatedPoll = await this.pollService.updatePoll(pollId, pollData);
      res.status(200).json({ data: updatedPoll, message: 'Poll updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  public endPoll = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const startPollData: StartPollDto = req.body;
      const updatedPoll = await this.pollService.endPoll(startPollData.pollId);
      res.status(200).json({ data: updatedPoll, message: 'Poll Ended successfully' });
    } catch (error) {
      next(error);
    }
  };

  public deletePoll = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const pollId = req.params.id;
      await this.pollService.deletePoll(pollId);
      res.status(200).json({ message: 'Poll deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  public startPoll = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const startPollData: StartPollDto = req.body;
      const startedPoll = await this.pollService.startPoll(startPollData, req.user.id);
      res.status(200).json({ data: startedPoll, message: 'Poll started successfully' });
    } catch (error) {
      next(error);
    }
  };

  public submitAnswer = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const answerData: CreateAnswerDto = {
        ...req.body,
        userId: req.user.id,
      };
      const answer = await this.pollService.submitAnswer(answerData);
      res.status(201).json({ data: answer, message: 'Answer submitted successfully' });
    } catch (error) {
      next(error);
    }
  };

  public getActivePoll = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const activePoll = await this.pollService.getActivePoll(req.user.id);
      if (activePoll) {
        res.status(200).json({ data: activePoll, message: 'Active poll retrieved successfully' });
      } else {
        res.status(404).json({ message: 'No active poll found' });
      }
    } catch (error) {
      next(error);
    }
  };

  public getPollResults = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const pollId = req.params.id;
      const results = await this.pollService.getPollResults(pollId);
      res.status(200).json({ data: results, message: 'Poll results retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };

  public getAllPolls = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const results = await this.pollService.getAllPolls(req.user.role);
      res.status(200).json({ data: results, message: 'Poll results retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };
}
