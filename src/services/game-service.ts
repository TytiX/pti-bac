import { Id, Params, Application, NullableId } from '@feathersjs/feathers';
import { timer, interval, Subscription } from 'rxjs';

import { Datas } from '../models/datas';
import { Game } from '../models/game';
import { LocalSocket } from '../models/LocalSocket';
import { User } from '../models/user';
import { Lobby } from '../models/lobby';

const LEADERBOARD_TIMEOUT = 10 * 1000; // 10s

export class GameService {
  db: Datas;
  app: Application<{}>;
  tickers: {[gameid: string]: Subscription} = {};

  constructor(db: Datas, app: Application) {
    this.db = db;
    this.app = app;
  }

  async get(id: Id, params: Params) {
    return this.db.getGame(id as string).toEntity();
  }

  async create(data: Partial<Lobby>, params?: Params) {
    const game = new Game(data);

    this.bindGameSocket(game);
    this.db.addGame(game);
    this.deleteLinkedLobby(game)
    return game;
  }

  bindGameSocket(game: Game) {
    const io = (this.app as unknown as any).io.of(`/game-${game.name}-${game.id}`);
    io.on('connection', (socket: LocalSocket) => {
      console.log('--- user connected');
      socket.on('user-connected', (user: User) => {
        console.log('--- user added');
        socket.user = user;
        game.connected ++;
        if (game.connected === game.users.length) {
          console.log('start a game');
          this.app.service('games').update(game.id, {step: 'leaderboard'});

          timer(LEADERBOARD_TIMEOUT).subscribe( () => {
            this.startGame(game);
          });
        }
      });
      socket.on('roundFinished', (user: User) => {
        // stop ticker...
        this.tickers[game.id].unsubscribe();
        // round finish by user
        this.app.service('games').update(game.id, { finishedFirst: user, step: 'correction'});
      });
      socket.on('validateCorretion', (user: User) => {
        game.correctionValidated[user.id] = true;
        if (Object.keys(game.correctionValidated).length === game.users.length) {
          this.app.service('games').update(game.id, {step: 'leaderboard'});

          timer(LEADERBOARD_TIMEOUT).subscribe( () => {
            this.startGame(game);
          });

        }
      });
      socket.on('disconnect', () => {
        console.log('--- user remove');
        game.connected--;
        game.removeUser(socket.user);
        if (game.connected === 0) {
          this.app.service('games').delete(game.id);
        } else {
          this.app.service('games').update(game.id, {users: game.users});
        }
      });
    });
  }

  startGame(game: Game) {
    this.app.service('games').update(game.id, {step: 'playing'});

    //output: 0,1,2,3,4,5....
    const subscribe = interval(1000).subscribe(val => {
      this.app.service('games').update(game.id, { currentRoundTimer: game.currentRoundTimer-1000 })
    });
    this.tickers[game.id] = subscribe;
    timer(game.roundTimer).subscribe( () => {
      subscribe.unsubscribe();
      this.app.service('games').update(game.id, {step: 'correction'});
    });
  }

  deleteLinkedLobby(game: Game) {
    this.app.service('lobbies').delete(game.id);
  }

  async update(id: NullableId, data: Partial<Game>, params?: Params) {
    const game = this.db.getGame(id as string);
    game.update(data);
    return game.toEntity();
  }

  async delete(id: Id) {
    const game = this.db.getGame(id as string);
    delete (this.app as unknown as any).io.nsps[`/game-${game.name}-${game.id}`];
    this.tickers[game.id].unsubscribe();
    this.db.deleteGame(id as string);
  }

}
