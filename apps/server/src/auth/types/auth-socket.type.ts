import { Socket } from 'socket.io';
import { UserSession } from 'src/users';

export interface AuthSocket extends Socket {
  session?: UserSession;
}