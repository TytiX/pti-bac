import { timer, interval, Subscription } from 'rxjs';

import { Game } from '../models/game';
import { LocalSocket } from '../models/LocalSocket';
import { User } from '../models/user';

const LEADERBOARD_TIMEOUT = 5 * 1000; // 5s

export class GameSocket {
  app: any;
  io: SocketIO.Namespace;

  game: Game;

  ticker?: Subscription;

  constructor(app: any, game: Game) {
    this.app = app;
    this.game = game;
    this.io = this.app.io.of(`/game-${game.id}`);
    this.bindGameSocket()
  }

  bindGameSocket() {
    this.io.on('connection', (socket: LocalSocket) => {
      console.log('--- user connected');

      socket.on('user-connected', (user: User) => {
        console.log('--- user added');
        socket.user = user;
        this.game.connected ++;
        if (this.game.connected === this.game.users.length && this.game.status === 'waiting') {
          console.log('start a game', this.game);

          this.app.service('games').update(this.game.id, {
            step: 'leaderboard',
            status: 'playing'
          });
          timer(LEADERBOARD_TIMEOUT).subscribe( () => {
            this.startGame();
          });
        }
      });

      socket.on('roundFinished', this.roundFinished.bind(this));
      socket.on('validateCorretion', this.validateCorretion.bind(this));

      socket.on('disconnect', () => {
        console.log('--- user remove');
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
    this.ticker = interval(1000).subscribe(val => {
      this.app.service('games').update(this.game.id, { currentRoundTimer: this.game.currentRoundTimer-1000 })
    });
    timer(this.game.roundTimer).subscribe( () => {
      if (this.ticker) this.ticker.unsubscribe();
      this.app.service('games').update(this.game.id, {step: 'correction'});
    });
  }

  roundFinished(user: User) {
    // stop ticker...
    if (this.ticker) this.ticker.unsubscribe();
    // round finish by user
    this.app.service('games').update(this.game.id, { finishedFirst: user, step: 'correction'});
  }

  validateCorretion(user: User) {
    this.game.correctionValidated[user.id] = true;
    if (Object.keys(this.game.correctionValidated).length === this.game.users.length) {
      this.app.service('games').update(this.game.id, {step: 'leaderboard'});

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