import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Bus from "@/services/bus"
import electron from 'electron'

import "@/icons";
import "@/icons/svg.js";



Vue.prototype.$bus = Bus;
Vue.prototype.$electron= electron

import { gElecSet } from "@/tool/global.electron.js";
gElecSet(electron)


Vue.config.productionTip = false;




new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
