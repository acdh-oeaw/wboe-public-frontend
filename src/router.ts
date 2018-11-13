import Router from 'vue-router'
import Main from '@components/Main.vue'
import Maps from '@components/Maps.vue'
import NotFound from '@components/NotFound.vue'
export default new Router({
  mode : 'history',
  routes : [
    {
      path: '/',
      component: Main
    },
    {
      path: '/maps',
      component: Maps,
    },
    // TODO: there are more properties to come.
    {
      path: '/maps/:collectionId',
      component: Maps,
      props: true
    },
    {
      path: '*',
      component: NotFound
    },
  ]
})
