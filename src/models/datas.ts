import { Category } from './category';
import { Lobby } from './lobby';
import { Game } from './game';

export class Datas {
  games = [];
  lobbies = [];

  constructor() {
  }

  getCategories(lobbyId: string) {
    const lobby = this.lobbies.find(l => {
      return l.id === lobbyId;
    });
    return lobby ? lobby.categories : [];
  }
  addCategorieToLobby(lobbyId: string, data: Pick<Category, 'name'>) {
    const lobby = this.lobbies.find(l => {
      return l.id === lobbyId;
    });
    const categorie = {
      id: lobby.categories.length,
      name: data.name
    }
    lobby.categories.push(categorie);
    return categorie;
  }

  getLobby(id: string): Lobby {
    return this.lobbies.find(l => {
      return l.id === id;
    });
  }
  addLobby(lobby: Lobby) {
    this.lobbies.push(lobby);
  }
  getLobbies() {
    return this.lobbies.map(l => { return l.toEntity() });
  }
  deleteLobby(id: string) {
    const index = this.lobbies.findIndex(l => {
      return l.id === id;
    });
    if (index >= 0) this.lobbies.splice(index, 1);
  }

  addGame(game: Game) {
    this.games.push(game);
  }
  getGame(id: string): Game {
    return this.games.find(g => {
      return g.id === id;
    });
  }
  deleteGame(id: string) {
    const index = this.games.findIndex(l => {
      return l.id === id;
    });
    if (index >= 0) this.games.splice(index, 1);
  }
}