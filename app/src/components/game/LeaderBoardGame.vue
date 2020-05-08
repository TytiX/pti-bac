<template>
  <div>
    <h3>Leaderboard</h3>
    <div>
      <div v-for="user of users" :key="user.id">{{user.name}} - {{board[user.id]}}</div>
    </div>
    <div class="mt-5">Début dans {{countdown | timer}}</div>
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

  countdownSubscription!: Subscription;
  countdown = 5 * 1000;

  mounted() {
    this.countdown = 5 * 1000;
    this.countdownSubscription = interval(1000).subscribe( () => {
      console.log(this.countdown);
      this.countdown -= 1000;
    });
  }

  destroyed() {
    this.countdownSubscription.unsubscribe();
  }

}
</script>
