import { INestApplicationContext } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { AuthService } from "./auth.service";
import { AuthSocket } from "./types";

export class AuthAdapter extends IoAdapter {
  private authService: AuthService

  constructor(private app: INestApplicationContext) {
    super(app);
    app.resolve<AuthService>(AuthService).then((authService) => {
      this.authService = authService;
    });
  }

  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);
    server.use(async (socket: AuthSocket, next) => {
      if (socket.handshake.headers?.authorization) {
        try {
          const session = await this.authService.getSessionByAccessToken(socket.handshake.headers.authorization.slice(7));
          socket.join([`user:${session.user.id}`]);
          socket.join([`session:${session.uuid}`]);
          socket.session = session;
        } catch {}
      } 

      socket.join('public');
      next();
    });
    return server
  }
}