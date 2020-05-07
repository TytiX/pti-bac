<template>
  <div>
    <h3>Leaderboard</h3>
    <div>
      <div v-for="user of users" :key="user.id">{{user.name}} - {{board[user.id]}}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import { User, LeaderBoard } from '@/models';

@Component
export default class LeaderBoardGame extends Vue {
  @Prop({required: true})
  users!: User[];
  @Prop({required: true})
  board!: LeaderBoard;
}
</script>
