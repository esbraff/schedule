import Vue from 'vue';

import VueOffline from 'vue-offline';
import HeyUI from 'heyui';

Vue.use(VueOffline);
Vue.use(HeyUI);

import "heyui/themes/index.less";

import App from './App.vue';

new Vue({
  render: h => h(App),
}).$mount('#app');