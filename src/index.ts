import Vue from 'vue'
import App from '@components/App.vue'
import Vuex from 'vuex'
import router from '@src/router'
import VueRouter from 'vue-router'
import * as fontLoader from 'webfontloader'
import Vuetify from 'vuetify'
// import store from './store'
import VueLazyload from 'vue-lazyload'

Vue.config.productionTip = true

Vue.use(Vuex)
Vue.use(VueRouter)
Vue.use(Vuetify, {
  theme: {
    ci: '#003263'
  }
})
Vue.use(VueLazyload, { lazyComponent : true })
import VueWordCloud from 'vuewordcloud'
Vue.component(VueWordCloud.name, VueWordCloud)
// load webfonts asynchronously
if (window) {
  fontLoader.load({
    custom: {
      families : ['HKGrotesk']
    }
  })
}

/* tslint:disable */
window.onload = () => {
  new Vue({
    el : '#app',
    render : h => h(App),
    router
  })
}
