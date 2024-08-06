import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import { NODE_ENV, PORT, ORIGIN, CREDENTIALS } from '@config';
import { ErrorMiddleware } from '@middlewares/error.middleware';
import { SocketService } from '@services/socket.service';
import { UserRoute } from './routes/users.route';
import { AuthRoute } from './routes/auth.route';
import { PollRoute } from './routes/poll.route';

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  private server: http.Server;
  public socketService: SocketService;

  constructor() {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 5000;

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeServer();
    this.initializeSocket();
  }

  public listen() {
    this.server.listen(this.port, () => {
      console.info(`🚀 App listening on the port ${this.port}`);
    });
  }

  public getServer() {
    return this.server;
  }

  private initializeMiddlewares() {
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes() {
    [new UserRoute(), new AuthRoute(), new PollRoute()].forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }

  private initializeServer() {
    this.server = http.createServer(this.app);
  }

  private initializeSocket() {
    this.socketService = new SocketService(this.server);
  }
}
