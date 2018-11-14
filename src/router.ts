import Router from 'vue-router'
import Main from '@components/Main.vue'
import Maps from '@components/Maps.vue'
import NotFound from '@components/NotFound.vue'
import Articles from '@components/Articles.vue'
import Article from '@components/Article.vue'

export default new Router({
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
      path: '/article/:file_name',
      component: Article,
      props: true
    },
    {
      path: '/maps',
      component: Maps,
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
