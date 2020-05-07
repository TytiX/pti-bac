import { Params, Application, Id, NullableId } from '@feathersjs/feathers';
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
    return this.db.getLobby(id as string).toEntity();
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
    const io = this.app.io.of(`/lobby-${lobby.name}-${lobby.id}`);
    io.on('connection', (socket: LocalSocket) => {
      // console.log('--- user connected');
      socket.on('user-connected', (user: User) => {
        // console.log('--- user added');
        socket.user = user;
        lobby.addUser(user);
        this.app.service('lobbies').update(lobby.id, {users: lobby.users});
      });
      socket.on('disconnect', () => {
        // console.log('--- user remove');
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

  async delete(id: Id) {
    const lobby = this.db.getLobby(id as string);
    delete this.app.io.nsps[`/lobby-${lobby.name}-${lobby.id}`];
    this.db.deleteLobby(id as string);
  }
}
