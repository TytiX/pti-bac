<template>
  <div>
    <AppNavBar :title="gameState.name"></AppNavBar>
    <div class="container mt-3">

      <div v-if="gameState.step === 'playing'">
        <div>{{gameState.currentLetter}}</div>
        <div>{{gameState.currentRoundTimer | timer}}</div>
        <FieldsGame
          :categories="gameState.categories"
          @user-change="userChange"
          @finish="finish">
        </FieldsGame>
      </div>

      <div v-else-if="gameState.step === 'correction'">
        <div>{{gameState.currentLetter}}</div>
        <CorrectionGame
          :users="gameState.users"
          :categories="gameState.categories"
          :correction="correction"
          @check-word="wordCheck"
          @confirm-correction="confirmCorrection">
        </CorrectionGame>
      </div>

      <div v-else>
        <div>{{gameState.currentLetter}}</div>
        <LeaderBoardGame
          :users="gameState.users"
          :board="leaderBoard">
        </LeaderBoardGame>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import io from 'socket.io-client';

import AppNavBar from '@/components/AppNavBar.vue';
import FieldsGame from '@/components/game/FieldsGame.vue';
import CorrectionGame from '@/components/game/CorrectionGame.vue';
import LeaderBoardGame from '@/components/game/LeaderBoardGame.vue';

import { GameState, CategoryWord, Correction, GameWordState } from '@/models';

@Component({
  filters: {
    timer: (value: number) => {
      const rem = value / 1000; // secs
      const min = Math.trunc(rem / 60);
      const sec = rem % 60;
      const minBuffer = min > 0 ? `${min}min ` : ''
      return minBuffer + `${sec}s`
    }
  },
  components: {
    AppNavBar,
    FieldsGame,
    CorrectionGame,
    LeaderBoardGame
  }
})
export default class Game extends Vue {
  gameState: GameState = {
    id: '',
    name: '',
    step: '',
    currentLetter: '',
    currentRoundTimer: 0,
    users: [],
    categories: []
  };
  correction = {};
  leaderBoard = {};
  client!: SocketIOClient.Socket;

  mounted() {
    this.$feather.service('games').get(this.$route.params.gameId).then( (game: GameState) => {
      this.gameStateUpdate(game);
      this.client = io(`/game-${game.name}-${game.id}`);
      this.bindEvent();
    });
    this.$feather.service('games').on('updated', this.gameStateUpdate.bind(this));
  }

  bindEvent() {
    this.client.emit('user-connected', this.$service.getUser());
  }

  gameStateUpdate(game: GameState) {
    if (game && this.$route.params.gameId === game.id) {
      this.gameState = game;
      this.leaderBoard = game.leaderBoard || {};
      this.correction = game.correction || {};
    }
  }

  /**
   * Game callbacks
   */
  userChange(userInputs: CategoryWord) {
    this.$feather.service('games').update(this.gameState.id, {
      gameState: this.toGlobalStateGame(userInputs)
    });
  }
  finish(userInputs: any) {
    // send finish to server
    this.client.emit('roundFinished', this.$service.getUser());
  }
  toGlobalStateGame(userInputs: CategoryWord) {
    const ggs: GameWordState = {}
    const me = this.$service.getUser();
    for (const categorie of this.gameState.categories) {
      ggs[categorie.id] = {};
      ggs[categorie.id][me.id] = userInputs[categorie.id];
    }
    return ggs;
  }

  /**
   * Correction callback methods
   */
  wordCheck(correction: Correction) {
    // send check
    this.$feather.service('games').update(this.gameState.id, {
      correction: correction
    });
  }
  confirmCorrection(correction: any) {
    this.client.emit('validateCorretion', this.$service.getUser());
  }

}
</script>
