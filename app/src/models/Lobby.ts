import { Category } from './Category';
import { User } from './User';

export interface Lobby {
  id: string;
  name: string;
  users: User[];
  categories: Category[];
  timer: number;
}
