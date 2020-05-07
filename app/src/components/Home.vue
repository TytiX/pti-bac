<template>
  <div>
    <AppNavBar></AppNavBar>

    <div class="container mt-3">
      <b-input-group size="sm" class="mb-3" prepend="Nouvelle Partie">
        <b-form-input @keyup.enter="newGame" v-model="newGameName" trim></b-form-input>
        <b-input-group-append>
          <b-button @click="newGame" size="sm" variant="success"><b-icon icon="plus"></b-icon></b-button>
        </b-input-group-append>
      </b-input-group>

      <b-list-group>
        <b-list-group-item v-for="lobby of lobbies"
          :key="lobby.id"
          :to="`/lobby/${lobby.id}`">
          {{lobby.name}}
        </b-list-group-item>
      </b-list-group>
    </div>

  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

import AppNavBar from '@/components/AppNavBar.vue';
import { Lobby } from '@/models';

@Component({
  components: {
    AppNavBar
  }
})
export default class Home extends Vue {
  newGameName = '';
  lobbies: Lobby[] = [];

  mounted() {
    this.$feather.service('lobbies').find().then( (lobbies: Lobby[]) => {
      this.lobbies = lobbies;
    });
    this.$feather.service('lobbies').on('created', this.populateList.bind(this));
    this.$feather.service('lobbies').on('deleted', this.removeList.bind(this));
  }
  populateList(lobby: Lobby, params: any) {
    this.lobbies.push(lobby);
  }
  removeList(lobby: Lobby) {
    const index = this.lobbies.findIndex( l => { l.id === lobby.id });
    if (index < 0) this.lobbies.splice(index, 1);
  }

  newGame() {
    if (this.newGameName && this.newGameName.length > 0) {
      this.$feather.service('lobbies').create({
        name: this.newGameName
      }).then( (lobby: Lobby) => {
        this.$router.push(`/lobby/${lobby.id}`);
      });
      this.newGameName = '';
    }
  }

}
</script>
