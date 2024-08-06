import { Server, Socket } from 'socket.io';
import { UserService } from './user.service';
import { PollService } from './poll.service';
import { ACCESS_TOKEN_SECRET, ORIGIN_WHITELIST } from '@/config';
import { verify } from 'jsonwebtoken';
import { DataStoredInToken } from '@/interfaces/auth.interface';

export class SocketService {
  private io: Server;
  private userService: UserService;
  private pollService: PollService;

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: ORIGIN_WHITELIST.split(','),
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });
    this.userService = new UserService();
    this.pollService = new PollService();
    this.initialize();
  }

  private initialize() {
    this.io.use(async (socket: Socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const secretKey: string = ACCESS_TOKEN_SECRET;
        const verificationResponse = (await verify(token, secretKey)) as DataStoredInToken;
        const user = await this.userService.findUserById(verificationResponse.userId);
        if (!user) {
          return next(new Error('User not found'));
        }
        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.data.user.id}`);

      const room = socket.data.user.role === 'TEACHER' ? 'teachers' : 'students';
      socket.join(room);

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.data.user.id}`);
      });

      socket.on('joinPoll', (pollId: string) => {
        socket.join(`poll_${pollId}`);
      });

      socket.on('leavePoll', (pollId: string) => {
        socket.leave(`poll_${pollId}`);
      });

      socket.on('startPoll', async (pollId: string) => {
        try {
          const startPollData = { pollId };
          const updatedPoll = await this.pollService.startPoll(startPollData, socket.data.user.id);

          const pollData = {
            pollId: updatedPoll.id,
            status: 'active',
            startTime: updatedPoll.startTime.toISOString(),
            endTime: updatedPoll.endTime.toISOString(),
          };

          this.io.to(`poll_${pollId}`).emit('pollStarted', pollData);
          socket.emit('pollStartedConfirmation', pollData);
        } catch (error) {
          console.error('Error starting poll:', error);
          socket.emit('pollError', { message: 'Failed to start poll', error: error.message });
        }
      });

      socket.on('getPollStatus', async (pollId: string) => {
        try {
          const poll = await this.pollService.getPoll(pollId);

          if (!poll) {
            throw new Error('Poll not found');
          }

          const now = new Date();
          const endTime = new Date(poll.endTime);

          if (now > endTime || !poll.isActive) {
            socket.emit('pollStatus', { pollId, status: 'ended' });
          } else {
            socket.emit('pollStatus', {
              pollId,
              status: 'active',
              startTime: poll.startTime.toISOString(),
              endTime: poll.endTime.toISOString(),
            });
          }
        } catch (error) {
          console.error('Error getting poll status:', error);
          socket.emit('pollError', { message: 'Failed to get poll status' });
        }
      });

      socket.on('submitAnswer', async answerData => {
        try {
          const answer = await this.pollService.submitAnswer(answerData);
          const updatedPoll = await this.pollService.getPoll(answerData.pollId);

          this.io.to(`poll_${answerData.pollId}`).emit('pollAnswered', updatedPoll);
          socket.emit('answerSubmitted', answer);
        } catch (error) {
          console.error('Error submitting answer:', error);
          socket.emit('pollError', { message: 'Failed to submit answer', error: error.message });
        }
      });
    });
  }

  public getIO(): Server {
    return this.io;
  }

  public emitToUser(userId: string, event: string, data: any) {
    this.io.to(userId).emit(event, data);
  }

  public emitToTeachers(event: string, data: any) {
    this.io.to('teachers').emit(event, data);
  }

  public emitToStudents(event: string, data: any) {
    this.io.to('students').emit(event, data);
  }

  public emitToPoll(pollId: string, event: string, data: any) {
    this.io.to(`poll_${pollId}`).emit(event, data);
  }

  public emitToAll(event: string, data: any) {
    this.io.emit(event, data);
  }
}
