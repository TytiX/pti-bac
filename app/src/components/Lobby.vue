<template>
  <div>
    <AppNavBar :title="lobby.name | capitalize"></AppNavBar>
    <div class="container mt-3">

      <h4 class="mt-3">Game time</h4>
      <b-input-group class="mt-3">
        <b-form-timepicker
          v-model="timer2time"
          size="sm"
          show-seconds>
        </b-form-timepicker>
      </b-input-group>

      <h4 class="mt-3">Categories</h4>
      <b-input-group size="sm" class="mt-3 mb-3" prepend="Nouvelle Categorie">
        <b-form-input @keyup.enter="updateCategories('add')" v-model="newCategorie"></b-form-input>
        <b-input-group-append>
          <b-button @click="updateCategories('add')" size="sm" variant="success"><b-icon icon="plus"></b-icon></b-button>
        </b-input-group-append>
      </b-input-group>

      <b-list-group class="text-left">
        <b-list-group-item v-for="category of lobby.categories" :key="category.id"
          class="d-flex justify-content-between align-items-center">
          {{category.name}}
          <b-button @click="updateCategories('remove', category)" variant="danger"><b-icon icon="trash"></b-icon></b-button>
        </b-list-group-item>
      </b-list-group>

      <b-button class="mt-3" @click="startGame">Start game</b-button>

      <h4 class="mt-5">Users</h4>
      <b-list-group>
        <b-list-group-item v-for="user of lobby.users" :key="user.id">
          {{ user.name }}
        </b-list-group-item>
      </b-list-group>

    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import io from 'socket.io-client';

import AppNavBar from '@/components/AppNavBar.vue';
import { Lobby, Category, GameState } from '@/models';

@Component({
  filters: {
    capitalize: (text: string) => {
      return text ? text[0].toUpperCase() + text.slice(1) : '';
    }
  },
  components: {
    AppNavBar
  }
})
export default class LobbyComp extends Vue{
  newCategorie = '';
  lobby: Lobby = {
    id: '',
    name: '',
    categories: [],
    users: [],
    timer: 0
  };
  client!: SocketIOClient.Socket;

  mounted() {
    this.$feather.service('lobbies').get(this.$route.params.lobbyId).then( (lobby: Lobby) => {
      this.updateLobby(lobby);
      this.client = io(`/lobby-${lobby.name}-${lobby.id}`);
      this.bindEvent();
    });
    this.$feather.service('lobbies').on('updated', this.updateLobby.bind(this));
    this.$feather.service('games').on('created', this.gameCreated.bind(this));
  }

  bindEvent() {
    this.client.emit('user-connected', this.$service.getUser());
  }

  numToString(num: number): string {
    if (num === 0) return '00';
    return num > 9 ? '' + num : '0' + num
  }

  get timer2time () {
    let rem = this.lobby.timer / 1000; // secs
    const hours = Math.trunc(rem / 3600);
    rem = rem % 3600;
    const min = Math.trunc(rem / 60);
    const sec = rem % 60;
    return this.numToString(hours) + ':' + this.numToString(min) + ':' + this.numToString(sec);
  }

  set timer2time(value: string) {
    const splits = value.split(':');
    // convert...      hours                        mins                   secs
    this.lobby.timer = Number(splits[0]) * 3600 * 1000 + Number(splits[1]) * 60 * 1000 + Number(splits[2]) * 1000;
    console.log('-- set timer: ', this.lobby.timer);
    // update lobby
    this.$feather.service('lobbies').update(this.lobby.id, this.lobby);
  }

  updateLobby(lobby: Lobby) {
    if (lobby && this.$route.params.lobbyId === lobby.id) {
      this.lobby = lobby;
    }
  }

  updateCategories(action: 'add' | 'remove', item?: Category) {
    if (action === 'add') {
      this.lobby.categories.push({ id: this.lobby.categories.length, name: this.newCategorie });
    } else if (action === 'remove' && item) {
      const index = this.lobby.categories.indexOf(item);
      this.lobby.categories.splice(index, 1);
    }
    this.$feather.service('lobbies').update(this.lobby.id, this.lobby).then( () => {
      this.newCategorie = '';
    });
  }

  gameCreated(game: GameState) {
    if ( game.id === this.$route.params.lobbyId ) {
      this.$router.push(`/game/${game.id}`);
    }
  }

  startGame() {
    // start
    this.$feather.service('games').create(this.lobby);
  }

  beforeDestroy() {
    this.client.disconnect();
  }
}
</script>

<style lang="scss" scoped>
.text-left {
  text-align: left;
}
</style>
