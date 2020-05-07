import Home from './components/Home.vue';
import Lobby from './components/Lobby.vue';
import Game from './components/Game.vue';

export default [
  { path: '/', component: Home },
  { path: '/lobby/:lobbyId', component: Lobby },
  { path: '/game/:gameId', component: Game }
];
