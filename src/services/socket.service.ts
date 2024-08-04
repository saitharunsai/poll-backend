import { Server, Socket } from 'socket.io';
import { verifyJwt } from '../utils/jwt';
import { UserService } from './user.service';

export class SocketService {
  private io: Server;
  private userService: UserService;

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });
    this.userService = new UserService();
    this.initialize();
  }

  private initialize() {
    this.io.use(async (socket: Socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const decoded = verifyJwt(token);
        const user = await this.userService.findUserById(decoded.userId);
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
