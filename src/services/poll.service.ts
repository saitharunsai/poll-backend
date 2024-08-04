import { PrismaClient } from '@prisma/client';
import { HttpException } from '@exceptions/httpException';
import { CreatePollDto, UpdatePollDto, Poll, Answer, CreateAnswerDto, StartPollDto } from '@schemas/poll.schema';
import { socketService } from '@/server';

const prisma = new PrismaClient();

export class PollService {
  public async createPoll(pollData: CreatePollDto, userId: string): Promise<Poll> {
    const activePolls = await prisma.poll.findMany({
      where: { createdBy: userId, isActive: true },
    });

    if (activePolls.length > 0) {
      throw new HttpException(400, 'You already have an active poll. Please end it before creating a new one.');
    }

    const poll = await prisma.poll.create({
      data: {
        ...pollData,
        createdBy: userId,
      },
    });

    socketService.emitToAll('newPoll', poll);
    return poll;
  }

  public async getPoll(pollId: string): Promise<Poll> {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { answers: true },
    });

    if (!poll) throw new HttpException(404, 'Poll not found');
    return poll;
  }

  public async updatePoll(pollId: string, pollData: UpdatePollDto): Promise<Poll> {
    const poll = await prisma.poll.update({
      where: { id: pollId },
      data: pollData,
    });

    socketService.emitToAll('pollUpdated', poll);
    return poll;
  }

  public async deletePoll(pollId: string): Promise<void> {
    await prisma.poll.delete({ where: { id: pollId } });
    socketService.emitToAll('pollDeleted', pollId);
  }

  public async startPoll(startPollData: StartPollDto, userId: string): Promise<Poll> {
    const poll = await prisma.poll.findUnique({
      where: { id: startPollData.pollId },
    });

    if (!poll) {
      throw new HttpException(404, 'Poll not found');
    }

    if (poll.createdBy !== userId) {
      throw new HttpException(403, "You don't have permission to start this poll");
    }

    if (poll.isActive) {
      throw new HttpException(400, 'This poll is already active');
    }

    const activePolls = await prisma.poll.findMany({
      where: { createdBy: userId, isActive: true },
    });

    if (activePolls.length > 0) {
      throw new HttpException(400, 'You already have an active poll. Please end it before starting a new one.');
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + poll.duration * 1000);

    const updatedPoll = await prisma.poll.update({
      where: { id: startPollData.pollId },
      data: {
        startTime,
        endTime,
        isActive: true,
      },
    });

    socketService.emitToAll('pollStarted', updatedPoll);

    // Schedule poll end
    setTimeout(async () => {
      await this.endPoll(updatedPoll.id);
    }, poll.duration * 1000);

    return updatedPoll;
  }

  public async endPoll(pollId: string): Promise<Poll> {
    const poll = await prisma.poll.update({
      where: { id: pollId },
      data: { isActive: false },
    });

    socketService.emitToAll('pollEnded', poll);
    return poll;
  }

  public async submitAnswer(answerData: CreateAnswerDto): Promise<Answer> {
    const poll = await this.getPoll(answerData.pollId);

    if (!poll.isActive) {
      throw new HttpException(400, 'This poll is not active');
    }

    if (poll.endTime && new Date() > poll.endTime) {
      throw new HttpException(400, 'Poll has ended');
    }

    const answer = await prisma.answer.create({
      data: answerData,
    });

    const updatedPoll = await this.getPoll(answerData.pollId);
    socketService.emitToAll('pollAnswered', updatedPoll);
    return answer;
  }

  public async getActivePoll(userId: string): Promise<Poll | null> {
    const activePoll = await prisma.poll.findFirst({
      where: {
        createdBy: userId,
        isActive: true,
      },
    });

    return activePoll;
  }

  public async getPollResults(pollId: string): Promise<any> {
    const poll = await this.getPoll(pollId);
    const results = poll.options.map(option => ({
      option,
      count: poll.answers.filter(answer => answer.option === option).length,
    }));

    return {
      pollId,
      title: poll.title,
      question: poll.question,
      results,
    };
  }

  public async getAllPolls(): Promise<any> {
    const poll = await prisma.poll.findMany({
      include: { answers: true },
    });
    return poll;
  }
}