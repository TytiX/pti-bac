<template>
  <div>
    <AppNavBar></AppNavBar>

    <div class="container mt-3">
      <b-input-group size="md" class="mb-3" prepend="Créer Partie">
        <b-form-input
          @keyup.enter="newGame"
          v-model="newGameName"
          placeholder="Nom de la partie" trim></b-form-input>
        <b-input-group-append>
          <b-button
            v-b-tooltip.hover title="Créer la partie"
            @click="newGame"
            variant="success">
            <b-icon icon="plus"></b-icon>
          </b-button>
        </b-input-group-append>
      </b-input-group>

      <h4>Parties en attente de joueurs</h4>
      <b-list-group>
        <!-- <b-list-group-item
          variant="success"
          to="#"
          @click="createDefaultLobby">Default game</b-list-group-item> -->
        <b-list-group-item v-for="lobby of lobbies"
          :key="lobby.id"
          :to="`/lobby/${lobby.id}`"
          class="d-flex justify-content-between align-items-center">
          {{lobby.name}}
          <b-badge variant="primary" pill>{{lobby.users.length}}</b-badge>
        </b-list-group-item>
      </b-list-group>
      <div v-if="lobbies.length === 0">
        Aucune partie en attente de joueurs, créer en une!
      </div>
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
    this.$feather.service('lobbies').on('updated', this.updateLobby.bind(this));
    this.$feather.service('lobbies').on('removed', this.removeList.bind(this));
  }
  populateList(lobby: Lobby, params: any) {
    this.lobbies.push(lobby);
  }
  updateLobby(lobby: Lobby) {
    if (lobby) {
      const lToUp = this.lobbies.find(l => l.id === lobby.id);
      if (!lToUp) return;
      lToUp.users = lobby.users;
    }
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

  createDefaultLobby() {
    this.$feather.service('lobbies').create({
      name: 'may the force be with you',
      categories: [
        { id: 0, name: 'Prénom'},
        { id: 1, name: 'Métier'},
        { id: 2, name: 'Personnage DISNEY'},
        { id: 3, name: 'Groupe de musique'},
        { id: 4, name: 'Sport'},
        { id: 5, name: 'Pays'},
        { id: 6, name: 'Ville'},
        { id: 7, name: 'Fleur ou plante'},
        { id: 8, name: 'Marque'}
      ]
    }).then( (lobby: Lobby) => {
      this.$router.push(`/lobby/${lobby.id}`);
    });
    this.newGameName = '';
  }

  destroyed() {
    this.$feather.service('lobbies').removeListener('created');
    this.$feather.service('lobbies').removeListener('updated');
    this.$feather.service('lobbies').removeListener('removed');
  }

}
</script>
