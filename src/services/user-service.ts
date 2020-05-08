import { Id, Params, NullableId } from '@feathersjs/feathers';
import { v4 as uuidv4 } from 'uuid';

import { Datas } from '../models/datas';
import { User } from '../models/user';

export class UserService {
  db: Datas;

  constructor(db: Datas) {
    this.db = db;
  }

  async create(data: Partial<User>, params?: Params) {
    const user = {
      id: uuidv4(),
      name: 'Guest'
    };
    return user;
  }

  async update(id: NullableId, data: Partial<User>, params?: Params) {
    const game = this.db.getGame(id as string);
    if (!game) return;
    game.update(data);
    return game.toEntity();
  }

}
