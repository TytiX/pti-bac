import { Params, Application, Id, NullableId } from '@feathersjs/feathers';

import logger from '../logger';

import { Datas } from '../models/datas';
import { Lobby } from '../models/lobby';
import { User } from '../models/user';
import { LocalSocket } from '../models/LocalSocket';

export class LobbyService {
  db: Datas;
  app: Application<{}>;

  constructor(db: Datas, app: Application) {
    this.db = db;
    this.app = app;
  }

  async get(id: Id, params?: Params) {
    const lobby = this.db.getLobby(id as string);
    if (lobby) return lobby.toEntity();
    return lobby;
  }

  async find(params?: Params) {
    return this.db.getLobbies();
  }

  async create(data: Partial<Lobby>, params?: Params) {
    const lobby: Lobby = new Lobby(data);
    this.bindLobbySocket(lobby);
    this.db.addLobby(lobby);
    return lobby;
  }

  bindLobbySocket(lobby: Lobby) {
    const io = (this.app as unknown as any).io.of(`/lobby-${lobby.id}`);
    io.on('connection', (socket: LocalSocket) => {
      logger.info('--- user connected');
      socket.on('user-connected', (user: User) => {
        logger.info('--- user added');
        socket.user = user;
        lobby.addUser(user);
        this.app.service('lobbies').update(lobby.id, {users: lobby.users});
      });
      socket.on('disconnect', () => {
        logger.info('--- user remove');
        lobby.removeUser(socket.user);
        this.app.service('lobbies').update(lobby.id, {users: lobby.users});
      });
    });
  }

  async update(id: NullableId, data: Partial<Lobby>, params?: Params) {
    const lobby = this.db.getLobby(id as string);
    if (lobby) {
      lobby.update(data);
      return lobby.toEntity();
    } else {
      return null;
    }
  }

  async remove(id: Id) {
    const lobby = this.db.getLobby(id as string);
    if (!lobby) return;
    delete (this.app as unknown as any).io.nsps[`/lobby-${lobby.id}`];
    this.db.deleteLobby(id as string);
    return lobby;
  }
}
