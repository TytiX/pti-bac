import { User } from './user';

export interface LocalSocket extends SocketIO.Socket {
  user?: User;
}
