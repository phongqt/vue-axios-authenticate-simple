import Vue from 'vue'
import Vuelidate from 'vuelidate'

import store from './store'
import App from './App'
import router from './router'
import axios from 'axios'


Vue.config.productionTip = false

axios.defaults.baseURL = 'https://vue-stock-trader-f97ae.firebaseio.com/';

// axios.defaults.headers.common['Authorization'] = 'test';
axios.defaults.headers.get['Accepts'] = 'application/json';
Vue.use(Vuelidate);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
