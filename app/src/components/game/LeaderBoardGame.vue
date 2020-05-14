<template>
  <div>
    <h3>{{ $t('leaderboard') }}</h3>
    <div>
      <b-table striped hover :items="leaderboard" :fields="fields"></b-table>
      <!-- {{ leaderboard }} -->
    </div>
    <div class="mt-5">{{ $t('start-in') }} {{countdown | timer}}</div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { interval, Subscription } from 'rxjs';

import { User, LeaderBoard } from '@/models';

@Component({
  filters: {
    timer: (value: number) => {
      const rem = value / 1000; // secs
      const min = Math.trunc(rem / 60);
      const sec = rem % 60;
      const minBuffer = min > 0 ? `${min}min ` : ''
      return minBuffer + `${sec}s`
    }
  }
})
export default class LeaderBoardGame extends Vue {
  @Prop({required: true})
  users!: User[];
  @Prop({required: true})
  board!: LeaderBoard;

  fields = ['name', 'score'];
  leaderboard: {userId: string; name: string; score: number}[] = [];

  countdownSubscription!: Subscription;
  countdown = 5 * 1000;

  mounted() {
    this.countdown = 5 * 1000;
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

  destroyed() {
    this.countdownSubscription.unsubscribe();
  }

}
</script>
