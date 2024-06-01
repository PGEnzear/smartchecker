import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { UserDto } from 'src/users';

@Injectable()
export class IOService {
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  getServer() {
    return this.server
  }

  emitSessionConfirmed(session_uuid: string, user: UserDto) {
    return this.server.to(`session:${session_uuid}`).emit("session.confirmed", user)
  }

  emitWalletTaskProcessed(user_id: string, data: any) {
    return this.server.to(`user:${user_id}`).emit("wallet_task.processed", data)
  }

  emitWalletTaskCompleted(user_id: string, data: any) {
    return this.server.to(`user:${user_id}`).emit("wallet_task.completed", data)
  }

  emitLogout(user_id: string) {
    return this.server.to(`user:${user_id}`).emit("logout")
  }
}