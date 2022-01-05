import Vue from 'vue'
import Router from 'vue-router'
import store from './vuex/store'
const Home = () => import('./views/Home.vue')
const CommandCentre = () => import('./views/CommandCentre.vue')
const Leaderboard = () => import('./components/organisms/Leaderboard.vue')

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/command-centre',
      name: 'command-centre',
      component: CommandCentre,
      meta: { requiresAuth: true }
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: Leaderboard
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.name == 'home') {
    if (to.query.action == 'login' || to.query.action == 'loginV2') {
      // Remove the query params from the address and pass them as router's parameters
      next({ name: 'home', params: { action: 'loginV2' } })
      return
    }
  }

  const authRequired = to.matched.some((record) => record.meta.requiresAuth)
  // console.log(to.name, to.params, ' | authRequired ?', authRequired)

  if (authRequired) {
    const userString = localStorage.getItem('user')
    let hasCookie = !!userString

    if (hasCookie) {
      const userData = JSON.parse(userString)
      // Check if token is expired
      const expirationTimestamp = userData.expirationTimestamp || ''
      const nowTimestamp = new Date().toISOString()
      const expired = expirationTimestamp < nowTimestamp
      if (expired) {
        // localStorage.removeItem('user')
        // console.log('cookie cleared')
        // console.log('router.beforeEach.logout')
        store.dispatch('logout')
        // console.log('log out requested')
        hasCookie = false
      }
    }

    if (authRequired) {
      if (!hasCookie) {
        console.warn('Session expired, redirected to home')
        next({ name: 'home', params: { expired: true } })
      } else if (to.name == 'command-centre') {
        const loginType = to.params.type || 'email'
        if (loginType == 'MetaMask' && !to.params.userId) {
          // No account, redirect to home
          console.warn('No wallet address, redirect to home')
          if (from.name == 'home') {
            next(false)
          } else {
            next('/')
          }
        } else {
          next()
        }
      } else {
        next()
      }
    } else if (hasCookie && to.name == 'home') {
      next('command-centre')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
