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
    setLogoutTimer(context, expiresIn) {
      setTimeout(function() {
        context.dispatch('logout');
      }, expiresIn * 1000);
    },
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
        const now = new Date();
        const expirationDate = new Date(now.getTime() + data.expiresIn * 1000);
        localStorage.setItem('token', data.idToken);
        localStorage.setItem('userId', data.localId);
        localStorage.setItem('expiresIn', expirationDate);
        
        context.dispatch('storeUser', authData);
        context.dispatch('setLogoutTimer', data.expiresIn);
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

        const now = new Date();
        const expirationDate = new Date(now.getTime() + data.expiresIn * 1000);
        localStorage.setItem('token', data.idToken);
        localStorage.setItem('userId', data.localId);
        localStorage.setItem('expiresIn', expirationDate);

        context.commit('authUser', {
          idToken: data.idToken,
          userId: data.localId
        });
        context.dispatch('setLogoutTimer', data.expiresIn);
        router.replace('/dashboard');
      }).catch(err => console.log(err));
    },
    tryAutoLogin(context) {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const expirationDate = localStorage.getItem('expiresIn');
      const now = new Date();
      if (now >= expirationDate) {
        return;
      }
      const userId = localStorage.getItem('userId');
      context.commit('authUser', {
        idToken: token,
        userId: userId
      });
    },
    logout (context) {
      context.commit('clearAuthData');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('expiresIn');
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