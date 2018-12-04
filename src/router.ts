import Router from 'vue-router'
import Main from '@components/Main.vue'
import Maps from '@components/Maps.vue'
import NotFound from '@components/NotFound.vue'
import Articles from '@components/Articles.vue'
import Article from '@components/Article.vue'

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
      path: '/articles/:file_name',
      component: Article,
      props: true
    },
    {
      path: '/maps',
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
      children: [
        {
          path: ''
        }
      ]
    }
  ]
})

// r.beforeEach((ro) => {
//   console.log(ro)
// })

export default r
