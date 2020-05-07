import { Category } from './category';
import { User } from './user';

interface WordValidation {
  [userid: string]: boolean
}
class WordCorrection {
  word: string;
  validations: WordValidation;
}
class UserWordCorrection {
  [userid: string]: WordCorrection;
}
export class Correction {
  [categorieId: number]: UserWordCorrection;

  constructor(categories: Category[]) {
    for (const category of categories) {
      this[category.id] = new UserWordCorrection();
    }
  }
}

class UserWord {
  [userid: string]: string;
}
export class GameState {
  [categorieId: number]: UserWord;

  constructor(categories: Category[], users: User[]) {
    for (const category of categories) {
      this[category.id] = new UserWord();
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
