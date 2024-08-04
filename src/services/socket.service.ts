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

      // Join a room based on user role
      const room = socket.data.user.role === 'TEACHER' ? 'teachers' : 'students';
      socket.join(room);

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.data.user.id}`);
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

  public emitToAll(event: string, data: any) {
    this.io.emit(event, data);
  }
}