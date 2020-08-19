import Vue from 'vue'
import VueRouter from 'vue-router'

import WelcomePage from '../components/welcome/Welcome'
import DashboardPage from '../components/dashboard/Dashboard'
import SignupPage from '../components/auth/SignUp'
import SigninPage from '../components/auth/SignIn'
import store from '../store'

Vue.use(VueRouter)

const routes = [
  { path: '/', component: WelcomePage },
  { path: '/signup', component: SignupPage },
  { path: '/signin', component: SigninPage },
  { path: '/dashboard', component: DashboardPage, 
    beforeEnter (to, from, next) {
      if (store.state.idToken) {
        next();
      } else {
        next('/signin');
      }
    }
}
]

export default new VueRouter({mode: 'history', routes})