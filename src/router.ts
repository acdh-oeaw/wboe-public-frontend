import Router from 'vue-router'
import Main from '@components/Main.vue'
import Maps from '@components/Maps.vue'
import NotFound from '@components/NotFound.vue'
import Articles from '@components/Articles.vue'
import Article from '@components/Article.vue'
import Database from '@components/Database.vue'

const r = new Router({
  mode : 'history',
  routes : [
    {
      path: '/',
      component: Main
    },
    {
      path: '/articles',
      component: Articles
    },
    {
      path: '/articles/:filename',
      component: Article,
      props: true
    },
    {
      path: '/maps',
      name: 'maps',
      component: Maps,
      // combine route params and query params into props
      props: (route) => ({ ...route.params, ...route.query })
    },
    {
      path: '/maps/:collectionId',
      component: Maps,
      props: true
    },
    {
      path: '*',
      component: NotFound
    },
    {
      path: '/db',
      component: Database,
      // combine route params and query params into props
      props: (route) => ({ ...route.params, ...route.query })
    }
  ]
})

// r.beforeEach((ro) => {
//   console.log(ro)
// })

export default r
