import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(VueRouter)

import VueFeatherPlugin from './plugins/feather-plugin'
Vue.use(VueFeatherPlugin, {});

import routes from './routes'
const router = new VueRouter({
  routes
});

new Vue({
  render: h => h(App),
  router: router,
}).$mount('#app')
