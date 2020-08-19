import Vue from 'vue'
import Vuex from 'vuex'

import axios from './axios-auth'
import globalAxios from 'axios'
import router from './router/index'

Vue.use(Vuex)
const apiKey = 'AIzaSyA7a0xrKewoFKLisDITIm2BSVQF5WBRAQU'
export default new Vuex.Store({
  state: {
    idToken: null,
    userId: null,
    user: null
  },
  mutations: {
    authUser (state, userData) {
      state.idToken = userData.idToken;
      state.userId = userData.userId;
    },
    storeUser (state, userData) {
      state.user = userData;
    },
    clearAuthData (state) {
      state.idToken = null;
      state.userId = null;
    }
  },
  actions: {
    signup (context, authData) {
      axios.post(`/accounts:signUp?key=${apiKey}`,
      {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      }).then(res => {        
        const data = res.data;
        context.commit('authUser', {
          idToken: data.idToken,
          userId: data.localId
        });
        context.dispatch('storeUser', authData);
        router.replace('/dashboard');
      })
      .catch(err => console.log(err));
    },
    login (context, authData) {
      axios.post(`/accounts:signInWithPassword?key=${apiKey}`, {          
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
      .then(res => {
        const data = res.data;
        context.commit('authUser', {
          idToken: data.idToken,
          userId: data.localId
        });
        router.replace('/dashboard');
      }).catch(err => console.log(err));
    },
    logout (context) {
      context.commit('clearAuthData');
      router.replace('/signin');
    },
    storeUser (context, userData) {
      globalAxios.post('/user.json?auth=' + context.state.idToken, userData)
      .then(res => {

      }).catch(err => console.log(err));
    },
    fetchUser (context) {
      globalAxios.get('user.json?auth=' + context.state.idToken).then(res => {
        const data = res.data;
        const users = [];
        for(let key in data) {
          const user = data[key];
          user.id = key;
          users.push(user);
        }
        context.commit('storeUser', users[0]);
      }).catch(err => console.log(err));
    }
  },
  getters: {
    user (state) {
      return state.user;
    },
    isAuthenticated (state) {
      return state.idToken ? true : false;
    }
  }
})