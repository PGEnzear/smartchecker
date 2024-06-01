import { ClassSerializerInterceptor, Injectable, UseInterceptors, Logger } from "@nestjs/common";
import { OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from 'socket.io';
import { IOService } from "./io.service";

@Injectable()
@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class IOGateway implements OnGatewayInit {
  private logger = new Logger(IOGateway.name);
  @WebSocketServer()
  private server: Server;

  constructor(
    private ioService: IOService
  ) { }

  async afterInit() {
    this.ioService.setServer(this.server);
    this.logger.log('WebSockets server is initialized and running');
  }
}