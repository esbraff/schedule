import Vue from 'vue';

import HeyUI from 'heyui';
Vue.use(HeyUI);

import "heyui/themes/index.less";

import App from './App.vue';

new Vue({
  render: h => h(App),
}).$mount('#app');