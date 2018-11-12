import Router from 'vue-router'
import Main from '@components/Main.vue'

export default new Router({
  mode : 'history',
  routes : [
    {
      path:      '/',
      component: Main
    }
  ]
})
