import { Id, Params, Application, NullableId } from '@feathersjs/feathers';

import logger from '../logger';

import { Datas } from '../models/datas';
import { Game } from '../models/game';
import { Lobby } from '../models/lobby';
import { GameSocket } from './game-socket';

export class GameService {
  db: Datas;
  app: Application<{}>;

  gameSocket: {[gameid: string]: GameSocket} = {};

  constructor(db: Datas, app: Application) {
    this.db = db;
    this.app = app;
  }

  async get(id: Id, params: Params) {
    const game = this.db.getGame(id as string)
    if (game) return game.toEntity();
    return game;
  }

  async create(data: Partial<Lobby>, params?: Params) {
    const game = new Game(data);

    logger.info('create a game: ', game);
    this.gameSocket[game.id] = new GameSocket((this.app as unknown as any), game);
    // this.bindGameSocket(game);
    this.db.addGame(game);
    this.deleteLinkedLobby(game)
    return game;
  }

  deleteLinkedLobby(game: Game) {
    this.app.service('lobbies').remove(game.id);
  }

  async update(id: NullableId, data: Partial<Game>, params?: Params) {
    const game = this.db.getGame(id as string);
    if (!game) return;
    game.update(data);
    return game.toEntity();
  }

  async remove(id: Id) {
    const game = this.db.getGame(id as string);
    if (!game) return;

    this.gameSocket[game.id].stop();

    delete this.gameSocket[game.id];
    logger.info('delete a game: ', game);

    this.db.deleteGame(id as string);
    return game;
  }

}
