import { timer, Subscription } from 'rxjs';

import logger from '../logger';

import { Game } from '../models/game';
import { LocalSocket } from '../models/LocalSocket';
import { User } from '../models/user';
import { Category } from '../models/category';

const LEADERBOARD_TIMEOUT = 10 * 1000; // 10s

export class GameSocket {
  app: any;
  io: SocketIO.Namespace;

  game: Game;

  ticker?: Subscription;
  timeOut?: Subscription;

  constructor(app: any, game: Game) {
    this.app = app;
    this.game = game;
    this.io = this.app.io.of(`/game-${game.id}`);
    this.bindGameSocket()
  }

  bindGameSocket() {
    this.io.on('connection', (socket: LocalSocket) => {
      logger.info('--- user connected');

      socket.on('user-connected', (user: User) => {
        logger.info('--- user added');
        socket.user = user;
        this.game.connected ++;
        if (this.game.connected === this.game.users.length && this.game.status === 'waiting') {
          logger.info('start a game', this.game);

          this.app.service('games').update(this.game.id, {
            step: 'leaderboard',
            status: 'playing'
          });
          timer(LEADERBOARD_TIMEOUT).subscribe( () => {
            this.startGame();
          });
        }
      });

      socket.on('user-input', this.userInput.bind(this));
      socket.on('roundFinished', this.roundFinished.bind(this));
      socket.on('validateCorretion', this.validateCorretion.bind(this));

      socket.on('disconnect', (reason: string) => {
        logger.info('--- user remove');
        this.game.connected--;
        this.game.removeUser(socket.user);
        if (this.game.connected === 0) {
          this.app.service('games').remove(this.game.id);
        } else {
          this.app.service('games').update(this.game.id, {users: this.game.users});
        }
      });
    });
  }

  startGame() {
    this.app.service('games').update(this.game.id, {step: 'playing'});

    //output: 0,1,2,3,4,5.... every sec
    // this.ticker = interval(1000).subscribe(val => {
    //   this.app.service('games').update(this.game.id, { currentRoundTimer: this.game.currentRoundTimer-1000 })
    // });
    this.timeOut = timer(this.game.roundTimer).subscribe( () => {
      if (this.ticker) this.ticker.unsubscribe();
      this.app.service('games').update(this.game.id, {step: 'correction'});
    });
  }

  userInput(input: {user: User; category: Category; word: string}) {
    if (this.game.gameState) {
      this.game.gameState[input.category.id][input.user.id] = input.word;
    }
    // not nessecary...
    // this.game.update({
    //   gameState: this.game.gameState
    // });
  }

  roundFinished(user: User) {
    // stop ticker...
    if (this.ticker) this.ticker.unsubscribe();
    if (this.timeOut) this.timeOut.unsubscribe();
    // round finish by user
    this.app.service('games').update(this.game.id, { finishedFirst: user, step: 'correction'});
  }

  validateCorretion(user: User) {
    this.game.correctionValidated[user.id] = true;
    if (Object.keys(this.game.correctionValidated).length === this.game.users.length) {
      this.app.service('games').update(this.game.id, {step: 'leaderboard'});
      if (this.timeOut) this.timeOut.unsubscribe();

      timer(LEADERBOARD_TIMEOUT).subscribe( () => {
        this.startGame();
      });
    }
  }


  stop() {
    delete (this.app as unknown as any).io.nsps[`/game-${this.game.id}`];
    if (this.ticker) this.ticker.unsubscribe();
  }
}