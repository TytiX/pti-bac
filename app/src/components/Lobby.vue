<template>
  <div>
    <AppNavBar :title="lobby.name | capitalize"></AppNavBar>
    <b-container fluid="md" class="mt-3">
      <b-row>
        <b-col>
          <h4 class="mt-3">{{ $t('time-per-round') }}</h4>
          <b-form-select v-model="timer2time" :options="timeOptions"></b-form-select>
        </b-col>
      </b-row>

      <b-row>
        <b-col md="6">
          <h4 class="mt-3">{{ $t('categories') }}</h4>
          <b-input-group size="md" class="mt-3 mb-3">
            <b-input-group-prepend>
              <b-button
                v-b-tooltip.hover :title="$t('predefined-categories')"
                variant="warning"
                v-b-modal.modal-categories>
                <b-icon icon="collection"></b-icon>
              </b-button>
            </b-input-group-prepend>
            <b-form-input
              :placeholder="$t('categorie')"
              @keyup.enter="updateCategories('add')"
              v-model="newCategorie" trim></b-form-input>
            <b-input-group-append>
              <b-button
                v-b-tooltip.hover :title="$t('add-categorie')"
                @click="updateCategories('add')"
                variant="success">
                <b-icon icon="plus"></b-icon>
              </b-button>
            </b-input-group-append>
          </b-input-group>

          <!-- <b-list-group class="text-left"> -->
          <draggable
            :list="lobby.categories"
            class="list-group"
            ghost-class="ghost"
            @start="dragging = true"
            @end="dragging = false">
            <b-list-group-item v-for="category of lobby.categories" :key="category.id"
              class="d-flex justify-content-between align-items-center movable">
              {{category.name}}
              <b-button @click="updateCategories('remove', category)" variant="danger">
                <b-icon icon="trash"></b-icon>
              </b-button>
            </b-list-group-item>
          </draggable>
          <!-- </b-list-group> -->
        </b-col>

        <b-col md="6">
          <h4 class="mt-3">
            {{ $t('players') }}
            <b-button v-b-tooltip.hover :title="$t('invite-pepole')" @click="share">
              <b-icon icon="person-plus"></b-icon>
            </b-button>
          </h4>
          <b-list-group>
            <b-list-group-item v-for="user of lobby.users" :key="user.id">
              {{ user.name }}
            </b-list-group-item>
          </b-list-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <b-button class="mt-3"
            v-b-tooltip.hover :title="$t('start-game')"
            @click="startModal">{{ $t('start-game') }}</b-button>
        </b-col>
      </b-row>

    </b-container>

    <b-modal id="modal-categories" size="lg" hide-footer centered :title="$t('categories')">
      <Categories @add-categories="addCategories"></Categories>
    </b-modal>

    <b-modal id="modal-lonely"
      :title="$t('confirm')"
      centered
      ok-only
      @ok="startGame">
      {{ $t('are-u-sure') }}
    </b-modal>

    <b-modal id="modal-confirm-start"
      :title="$t('confirm')"
      centered
      ok-only
      @ok="startGame">
      {{ $t('should-start') }}
    </b-modal>

    <b-modal id="modal-social-share"
      :title="$t('share-link')"
       size="lg"
      centered
      ok-only>
      <SocialSharing></SocialSharing>
    </b-modal>

  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import io from 'socket.io-client';
import draggable from 'vuedraggable'

import AppNavBar from '@/components/AppNavBar.vue';
import Categories from '@/components/Categories.vue';
import SocialSharing from '@/components/SocialSharing.vue';
import { Lobby, Category, GameState } from '@/models';

@Component({
  filters: {
    capitalize: (text: string) => {
      return text ? text[0].toUpperCase() + text.slice(1) : '';
    }
  },
  components: {
    draggable,
    AppNavBar,
    SocialSharing,
    Categories
  }
})
export default class LobbyComp extends Vue {
  newCategorie = '';
  lobby: Lobby = {
    id: '',
    name: '',
    categories: [],
    users: [],
    timer: 0
  };
  timeOptions = [
    { value: '00:00:30', text: '30 sec' },
    { value: '00:01:00', text: '1 min' },
    { value: '00:02:00', text: '2 min' },
    { value: '00:03:00', text: '3 min' },
    { value: '00:05:00', text: '5 min' },
    { value: '00:10:00', text: '10 min' }
  ];
  client!: SocketIOClient.Socket;

  mounted() {
    this.$feather.service('lobbies').get(this.$route.params.lobbyId).then( (lobby: Lobby) => {
      this.updateLobby(lobby);
      this.client = io(`/lobby-${lobby.id}`);
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

  addCategories(event: {categories: Category[]; action: string}) {
    switch(event.action) {
      case 'Add':
        break;
      case 'Set':
        this.lobby.categories.length = 0;
        this.$bvModal.hide('modal-categories');
        break;
    }
    for (const category of event.categories) {
      this.updateCategories('add', category);
    }
  }

  updateCategories(action: 'add' | 'remove', item?: Category) {
    if ( action === 'add' && (item || this.newCategorie.length > 0) ) {
      this.lobby.categories.push({ id: this.lobby.categories.length, name: item ? item.name : this.newCategorie });
    } else if (action === 'remove' && item) {
      const index = this.lobby.categories.indexOf(item);
      this.lobby.categories.splice(index, 1);
      this.lobby.categories = this.lobby.categories.map((c: Category, i: number) => {
        return {
          id: i,
          name: c.name
        }
      });
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

  startModal() {
    if (this.lobby.users.length === 1) {
      this.$bvModal.show('modal-lonely');
    } else {
      this.$bvModal.show('modal-confirm-start');
    }
  }
  startGame() {
    this.$feather.service('games').create(this.lobby);
  }

  beforeDestroy() {
    this.client.disconnect();
  }

  share() {
    // eslint-disable-next-line
    if ((navigator as any).share) {
      // eslint-disable-next-line
      (navigator as any).share({
        title: this.$t('invite-title'),
        text: this.$t('invite-text'),
        url: window.location.href
      });
    } else {
      // share modal
      this.$bvModal.show('modal-social-share');
    }
  }
}
</script>

<style lang="scss" scoped>
.text-left {
  text-align: left;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.movable {
    cursor: move;
}
</style>
