import Vue from 'vue'
import Main from '@components/Main.vue'
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

Vue.use(Vuetify)
Vue.use(VueLazyload, {
  lazyComponent : true
})
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
    render : h => h(Main),
    router,
    // store
  })
}
