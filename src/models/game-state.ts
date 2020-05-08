import { Category } from './category';
import { User } from './user';

interface WordValidation {
  [userid: string]: boolean
}
interface WordCorrection {
  word: string;
  validations: WordValidation;
}
interface UserWordCorrection {
  [userid: string]: WordCorrection;
}
export class Correction {
  [categorieId: number]: UserWordCorrection;

  constructor(categories: Category[]) {
    for (const category of categories) {
      this[category.id] = {};
    }
  }
}

interface UserWord {
  [userid: string]: string;
}
export class GameState {
  [categorieId: number]: UserWord;

  constructor(categories: Category[], users: User[]) {
    for (const category of categories) {
      this[category.id] = {};
      for (const user of users) {
        this[category.id][user.id] = '';
      }
    }
  }
}

export class LeaderBoard {
  [userid: string]: number;

  constructor(users: User[]) {
    for (const user of users) {
      this[user.id] = 0;
    }
  }
}
