<template>
  <v-app>
    <v-content>
      <v-container fill-height class="pa-0" app>
        <v-layout column>
          <v-flex>
            <!-- <v-flex class="text-xs-right" xs12>
              <v-btn class="text-no-transform" color="grey" small round flat>test</v-btn>
              <v-btn class="text-no-transform" color="grey" small round flat>test</v-btn>
            </v-flex> -->
            <v-layout>
              <v-flex xs12 class="text-xs-center">
                <img class="logo mt-4" src="/static/img/logo.svg" />
              </v-flex>
            </v-layout>
          </v-flex>
          <v-flex class="pl-3 pr-3">
            <v-flex>
              <v-tabs
                active-class="active-tab"
                grow
                dark
                class="tabs-top"
                fixed-tabs
                centered
                color="ci"
                slider-color="white">
                <v-tab to="/">Home</v-tab>
                <v-tab to="/articles">WBÖ-Artikel</v-tab>
                <v-tab to="/maps">Karten</v-tab>
                <v-tab to="/db">Datenbank</v-tab>
                <v-tab to="/resources">Materialien</v-tab>
              </v-tabs>
            </v-flex>
          </v-flex>
          <v-flex xs12 fill-height class="pa-3">
            <keep-alive>
              <router-view />
            </keep-alive>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { initialize as initGeo } from '../store/geo'

@Component
export default class App extends Vue {
  mounted() {
    initGeo()
  }
}
</script>

<style>
  @import 'https://fonts.googleapis.com/icon?family=Material+Icons';
  @import '../../node_modules/vuetify/dist/vuetify.min.css';
  @import '/static/css/materialdesignicons.min.css';
  @import '../styles/fonts.scss';
  @import '../styles/global.scss';
  .active-tab{
    color: white;
    background: rgba(255,255,255,.2)
  }
</style>
<style lang="scss" scoped>
.tabs-top{
  overflow: hidden;
  border-radius: 5px;
}
</style>

