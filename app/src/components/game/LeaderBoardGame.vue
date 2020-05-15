<template>
  <div>
    <h3>{{ $t('leaderboard') }}</h3>
    <div>
      <b-table striped hover :items="leaderboard" :fields="fields"></b-table>
      <!-- {{ leaderboard }} -->
    </div>
    <div class="mt-5">{{ $t('start-in') }} {{countdown | timer}}</div>
    <div class="mt-5">
      <b-button @click="sendChangeCategoryRequest" variant="warning" class="mr-3">Change Categories</b-button>
      <b-button @click="$router.push('/')" variant="danger">Stop</b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { interval, Subscription } from 'rxjs';

import { User, LeaderBoard } from '@/models';

const COUNTDOWN = 10 * 1000; // 10s

@Component({})
export default class LeaderBoardGame extends Vue {
  @Prop({required: true})
  users!: User[];
  @Prop({required: true})
  board!: LeaderBoard;

  fields = ['name', 'score'];
  leaderboard: {userId: string; name: string; score: number}[] = [];

  countdownSubscription!: Subscription;
  countdown = COUNTDOWN;

  mounted() {
    this.countdown = COUNTDOWN;
    this.countdownSubscription = interval(1000).subscribe( () => {
      this.countdown -= 1000;
    });
    this.populateLeaderBoard();
  }

  populateLeaderBoard() {
    for (const user of this.users) {
      this.leaderboard.push({
        userId: user.id,
        name: user.name,
        score: this.board[user.id]
      });
    }
    this.leaderboard.sort( (a, b) => {
      return b.score - a.score;
    });
  }

  sendChangeCategoryRequest() {
    //
  }

  destroyed() {
    this.countdownSubscription.unsubscribe();
  }

}
</script>
