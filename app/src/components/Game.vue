<template>
  <div>
    <AppNavBar :title="gameState.name"></AppNavBar>
    <div class="container mt-3 mb-3">

      <div v-if="gameState.step === 'playing'">
        <h4 v-html="$t('current-letter', { letter: gameState.currentLetter })"></h4>
        <div>{{gameState.currentRoundTimer | timer}}</div>
        <FieldsGame
          :categories="gameState.categories"
          @user-change="userChange"
          @finish="finish">
        </FieldsGame>
      </div>

      <div v-else-if="gameState.step === 'correction'">
        <h4 v-html="$t('past-letter', { letter: gameState.currentLetter })"></h4>
        <div v-if="gameState.finishedFirst" v-html="$t('finish-first', { name: gameState.finishedFirst.name })"></div>
        <CorrectionGame
          :users="gameState.users"
          :categories="gameState.categories"
          :correction="correction"
          @check-word="wordCheck"
          @confirm-correction="confirmCorrection">
        </CorrectionGame>
      </div>

      <div v-else>
        <h4 v-html="$t('next-letter', { letter: gameState.currentLetter })"></h4>
        <LeaderBoardGame
          :users="gameState.users"
          :board="leaderBoard"
          @send-categories-request="requestCategoriesChanges"
          @user-quit="quit">
        </LeaderBoardGame>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import io from 'socket.io-client';
import { interval, Subscription } from 'rxjs';

import AppNavBar from '@/components/AppNavBar.vue';
import FieldsGame from '@/components/game/FieldsGame.vue';
import CorrectionGame from '@/components/game/CorrectionGame.vue';
import LeaderBoardGame from '@/components/game/LeaderBoardGame.vue';

import { GameState, Correction, Category, User } from '@/models';

@Component({
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
  ticker?: Subscription;

  mounted() {
    this.$feather.service('games').get(this.$route.params.gameId).then( (game: GameState) => {
      this.gameStateUpdate(game);
      this.client = io(`/game-${game.id}`);
      this.bindEvent();
    });
    this.$feather.service('games').on('updated', this.gameStateUpdate.bind(this));
  }

  bindEvent() {
    this.client.emit('user-connected', this.$service.getUser());
    this.client.on('user-connected', (user: User) => {
      this.$bvToast.toast(
        this.$t('user-connect', { name: user.name }) as string,
        { variant: "success" }
      );
    });
    this.client.on('user-quit', (user: User) => {
      this.$bvToast.toast(
        this.$t('user-disconnect', { name: user.name }) as string,
        { variant: "danger" }
      );
    });
  }

  gameStateUpdate(game: GameState) {
    if (game && this.$route.params.gameId === game.id) {
      this.gameState = game;
      this.leaderBoard = game.leaderBoard || {};
      this.correction = game.correction || {};

      if (this.gameState.step === 'playing') {
        this.ticker = interval(1000).subscribe( () => {
          this.gameState.currentRoundTimer -= 1000;
        });
      } else {
        if (this.ticker) this.ticker.unsubscribe();
      }
    }
  }

  /**
   * Game callbacks
   */
  userChange(userWord: string, category: Category) {
    this.client.emit('user-input', {
      user: this.$service.getUser(),
      category: category,
      word: userWord
    });
  }
  finish(/* userInputs: any */) {
    // send finish to server
    this.client.emit('roundFinished', this.$service.getUser());
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
  confirmCorrection(/* correction: any */) {
    this.client.emit('validateCorretion', this.$service.getUser());
  }

  /**
   * LeaderBoard callbacks
   */
  requestCategoriesChanges() {
    this.client.emit('request-categorie-change', this.$service.getUser());
  }
  quit() {
    this.client.emit('user-quit', this.$service.getUser());
    this.$router.push('/');
  }

}
</script>
