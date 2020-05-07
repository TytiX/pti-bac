import { v4 as uuidv4 } from 'uuid';

import { Category } from './category';
import { User } from './user';
import { Lobby } from './lobby';
import { GameState, Correction, LeaderBoard } from './game-state';

export class Game {
  id: any;
  name: string;
  categories: Category[] = [];
  users: User[] = [];

  // state = 'created';
  connected = 0;

  roundTimer = 0;

  step = 'leaderboard';

  currentLetter = '';
  currentRoundTimer = 0;

  finishedFirst?: User;

  gameState?: GameState;

  correction?: Correction;
  correctionValidated: {[userid: string]: boolean} = {};

  leaderBoard: LeaderBoard;

  constructor(lobby: Partial<Lobby>) {
    this.id = lobby.id || uuidv4();
    this.name = lobby.name || '';
    this.categories = lobby.categories || [];
    this.users = lobby.users || [];
    this.roundTimer = lobby.timer;
    this.leaderBoard = new LeaderBoard(this.users);
    console.log('---- create game: ', this);
  }

  update(game: Partial<Game>) {
    // test
    if (game.step) {
      this.step = game.step;
      switch(this.step) {
        case 'playing':
          // if (this.currentLetter === '') this.drawLetter();
          this.gameState = new GameState(this.categories, this.users);
          this.currentRoundTimer = this.roundTimer;
          break;
        case 'correction':
          this.setupCorrection();
          this.correctionValidated = {};
          this.gameState = undefined;
          break;
        case 'leaderboard':
          this.drawLetter();
          this.calculatePoints();
          this.correction = undefined;
          this.correctionValidated = {};
          this.finishedFirst = undefined;
          break;
      }
    }
    this.currentRoundTimer = game.currentRoundTimer ? game.currentRoundTimer : this.currentRoundTimer;
    this.finishedFirst = game.finishedFirst ? game.finishedFirst : this.finishedFirst;

    if (game.gameState) {
      // update game state
      for (const category of this.categories) {
        for(const userid of Object.keys(game.gameState[category.id])) {
          this.gameState[category.id][userid] = game.gameState[category.id][userid];
        }
      }
    }
    if (game.correction) {
      // console.log('correction: ' + JSON.stringify(game.correction, null, 4));
      this.correction = game.correction;
    }
  }

  drawLetter() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letterIndex = Math.floor(Math.random() * letters.length);
    this.currentLetter = letters.split('')[letterIndex];
  }

  setupCorrection() {
    this.correction = new Correction(this.categories);
    if (this.gameState) {
      for(const category of this.categories) {
        for (const user of this.users) {
          // set validation
          const validations = {};
          for(const u of this.users) {
            validations[u.id] = false;
          }
          // set correction
          this.correction[category.id][user.id] = {
            word: this.gameState[category.id][user.id],
            validations
          };
        }
      }
    }
  }

  calculatePoints() {
    if (this.correction) {
      for (const category of this.categories) {
        // all words of this category
        const wordsOfCategory: string[] = [];
        for (const user of this.users) {
          wordsOfCategory.push(this.correction[category.id][user.id].word);
        }

        // for each user
        for (const user of this.users) {
          const validations = this.correction[category.id][user.id].validations;

          const oks = Object.values(validations).filter(v => v);

          if (oks.length > this.users.length / 2) {
            this.leaderBoard[user.id] += 10;
            if (this.isWordUnique(this.correction[category.id][user.id].word, wordsOfCategory)) {
              this.leaderBoard[user.id] += 10;
            }
          }
        }
      }
    }
  }

  isWordUnique(word: string, words: string[]) {
    return words.filter(w => w.toLowerCase() === word.toLowerCase()).length === 1;
  }

  removeUser(user: User) {
    const index = this.users.findIndex(u => {
      return u.id === user.id;
    });
    this.users.splice(index, 1);
  }

  toEntity() {
    return {
      id: this.id,
      name: this.name,
      step: this.step,
      currentLetter: this.currentLetter,
      currentRoundTimer: this.currentRoundTimer,
      users: this.users,
      categories: this.categories,
      gameState: this. gameState,
      correction: this.correction,
      leaderBoard: this.leaderBoard,
      finishedFirst: this.finishedFirst
    };
  }
}
