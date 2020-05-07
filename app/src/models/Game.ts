import { Category } from './Category';
import { User } from './User';
import { Correction } from './Correction';

export interface LeaderBoard {
  [userId: string]: number;
}

export interface CategoryWord {
  [categorieId: number]: string;
}

interface UserWord {
  [userid: string]: string;
}
export interface GameWordState {
  [categorieId: number]: UserWord;
}

export interface GameState {
  id: string;
  name: string;
  step: string;
  currentLetter: string;
  currentRoundTimer: number;
  users: User[];
  categories: Category[];

  finishedFirst: User;

  gameState?: GameWordState;
  correction?: Correction;
  leaderBoard?: LeaderBoard;
}
