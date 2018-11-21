<template>
  <v-app>
    <v-content>
      <v-container fill-height class="pa-0" app>
        <v-layout column>
          <v-flex>
            <v-flex xs12 class="text-xs-center">
              <img class="logo" src="/static/img/logo.svg" />
            </v-flex>
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
                color="#003263"
                slider-color="white">
                <v-tab to="/">Main</v-tab>
                <v-tab to="/maps">Karten</v-tab>
                <v-tab to="/articles">Artikel</v-tab>
                <v-tab to="/db">Datenbank</v-tab>
                <v-tab to="/resources">Materialien</v-tab>
              </v-tabs>
            </v-flex>
          </v-flex>
          <v-flex xs12 fill-height class="pa-3">
            <router-view />
          </v-flex>
        </v-layout>
      </v-container>
      <!-- <v-container class="main-container" fluid fill-height app>
        
      </v-container> -->
    </v-content>
  </v-app>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class App extends Vue {
  mounted() {
    console.log('APP')
  }
}
</script>

<style>
  @import 'https://fonts.googleapis.com/icon?family=Material+Icons';
  @import '../../node_modules/vuetify/dist/vuetify.min.css';
  @import '/static/css/materialdesignicons.min.css';
  @import '../styles/fonts.scss';
  @import '../styles/global.scss';
  .main-container{
    max-width: 1200px !important;
    margin: 0 auto !important;
  }
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

.logo{
  margin-top: 2em;
}
</style>

