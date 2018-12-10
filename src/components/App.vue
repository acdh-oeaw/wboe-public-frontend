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
                <img class="logo mt-2" src="/static/img/logo.svg" />
                <div class="project-name">Lexikographisches Informationssystem Österreich</div>
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
          <v-flex class="pl-5 pr-5 xmt-5 pb-5 text-xs-center" v-if="$route.name !== 'maps'">
            <v-divider class="ma-5" />
            <h4 class="mb-2 mt-2 grey--text">Ein Projekt der</h4>
            <v-layout align-center justify-space-around>
              <a target="_blank" href="https://www.oeaw.ac.at">
                <v-img aspect-ratio="1" width="150" max-height="70" contain src="https://vawadioe.acdh.oeaw.ac.at/fileadmin/bilder/oeaw_logo_446x192.png" alt="" class="src" />
              </a>
              <a target="_blank" href="https://vawadioe.acdh.oeaw.ac.at">
                <v-img aspect-ratio="1" width="150" max-height="125" contain src="/static/img/logo-vawadioe.png" alt="" class="src" />
              </a>
              <a target="_blank" href="https://acdh.oeaw.ac.at">
                <v-img aspect-ratio="1" width="150" max-height="70" contain src="https://vawadioe.acdh.oeaw.ac.at/fileadmin/bilder/acdh_logo120h.png" alt="" class="src" />
              </a>
              <a target="_blank" href="https://www.oeaw.ac.at/acdh/projects/wboe/">
                <v-img aspect-ratio="1" width="150" max-height="70" contain src="https://vawadioe.acdh.oeaw.ac.at/fileadmin/bilder/wboelogo_230px_transp.png" alt="" class="src" />
              </a>
            </v-layout>
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
<style>
html{
  font-size: 16px;
}
.application{
  line-height: 1.6;
}
</style>

<style lang="scss" scoped>
.tabs-top{
  overflow: hidden;
  border-radius: 5px;
}
.project-name{
  margin-top: -1em;
  margin-bottom: 1em;
  font-weight: bold;
  font-size: 90%;
  opacity: .5;
}
</style>

