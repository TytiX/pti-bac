import io from 'socket.io-client';
import { GameState, User } from '@/models';

export default class ApiService {
  app: any;
  gameSocket!: SocketIOClient.Socket;

  constructor(app: any) {
    this.app = app;
  }

  setUser(id: string, name: string) {
    localStorage.setItem('userId', id);
    localStorage.setItem('name', name)
  }

  setName(name: string) {
    localStorage.setItem('name', name);
  }

  getUser(): User {
    return {
      id: localStorage.getItem('userId') || '',
      name: localStorage.getItem('name') || ''
    }
  }

}
