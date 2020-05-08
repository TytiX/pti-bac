import { v4 as uuidv4 } from 'uuid';

import { Category } from './category';
import { User } from './user';

export class Lobby {
  id: string;
  name: string;
  categories: Category[] = [];
  users: User[] = [];
  // 5 min
  timer: number = 5 * 60 * 1000;

  constructor(data: Partial<Lobby>) {
    this.id = uuidv4();
    this.name = data.name || '';
    this.categories = data.categories || [];
    this.timer = data.timer || 5 * 60 * 1000;
  }

  addUser(user: User) {
    this.users.push(user);
  }

  removeUser(user?: User) {
    if (!user) return;
    const index = this.users.findIndex(u => {
      return u.id === user.id;
    });
    this.users.splice(index, 1);
  }

  update(lobby: Partial<Lobby>) {
    this.name = lobby.name ? lobby.name : this.name;
    this.categories = lobby.categories ? lobby.categories : this.categories;
    this.users = lobby.users ? lobby.users : this.users;
    this.timer = lobby.timer ? lobby.timer : this.timer;
  }

  toEntity() {
    return {
      id: this.id,
      name: this.name,
      categories: this.categories,
      users: this.users,
      timer: this.timer
    }
  }
}
