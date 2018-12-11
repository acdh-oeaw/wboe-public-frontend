import Router from 'vue-router'
import Main from '@components/Main.vue'
import Maps from '@components/Maps.vue'
import NotFound from '@components/NotFound.vue'
import Articles from '@components/Articles.vue'
import Article from '@components/Article.vue'
import Database from '@components/Database.vue'
import Resources from '@components/Resources.vue'
import Password from '@components/Password.vue'
import { userStore } from './store/user'

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
      path: '/resources',
      component: Resources,
      // combine route params and query params into props
      props: (route) => ({ ...route.params, ...route.query })
    },
    {
      path: '/db',
      component: Database,
      // combine route params and query params into props
      props: (route) => ({ ...route.params, ...route.query })
    },
    {
      path: '/password',
      component: Password,
      // combine route params and query params into props
      props: (route) => ({ ...route.params, ...route.query })
    },
    {
      path: '*',
      component: NotFound
    }
  ]
})

r.beforeEach((to, from, next) => {
  if (userStore.isLoggedIn || to.path === '/password') {
    next()
  } else {
    r.replace({ path: '/password', query: { initial_url: to.path } })
  }
})

export default r
