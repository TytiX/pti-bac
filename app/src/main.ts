import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n);

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

import i18n from './i18n'

import VueGtag from 'vue-gtag'

Vue.use(VueGtag, {
  config: { id: process.env.GOOGLE_ANALYTICS_ID },
  appName: 'Pti Bac',
  pageTrackerScreenviewEnabled: true
}, router)

new Vue({
  i18n,
  render: h => h(App),
  router: router,
}).$mount('#app')
