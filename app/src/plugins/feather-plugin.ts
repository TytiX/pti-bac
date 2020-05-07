import _Vue from 'vue';
import ApiService from '@/services/api-service';
import io from 'socket.io-client';
import feathers from '@feathersjs/client';
import { Application } from '@feathersjs/feathers';

import { User } from '@/models';

declare module 'vue/types/vue' {
  interface Vue {
    $service: ApiService;
    $feather: Application;
  }
}

export default function VueFeatherPlugin(Vue: typeof _Vue): void {
  // Set up socket.io
  const socket = io();
  // Initialize a Feathers app
  const app = feathers();

  // Register socket.io to talk to our server
  app.configure(feathers.socketio(socket));

  const apiService = new ApiService(app);

  if (!apiService.getUser().id) {
    app.service('users').create({}).then( (user: User) => {
      apiService.setUser(user.id, user.name);
    });
  }

  Vue.prototype.$service = apiService;
  Vue.prototype.$feather = app;
}
