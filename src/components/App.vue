<template>
  <v-app>
    <!-- <v-navigation-drawer app></v-navigation-drawer> -->
    <v-toolbar
      dark
      tabs
      flat
      scroll-off-screen
      color="#285495"
      app>
      <v-toolbar-side-icon></v-toolbar-side-icon>
      <v-toolbar-title>LIÖ</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tabs
        fixed-tabs
        slot="extension"
        centered
        color="transparent"
        slider-color="white">
        <v-tab to="/">Main</v-tab>
        <v-tab to="/maps">Karten</v-tab>
        <v-tab to="/articles">Artikel</v-tab>
        <v-tab to="/db">Datenbank</v-tab>
      </v-tabs>
    </v-toolbar>
    <v-content>
      <v-container class="main-container" fluid fill-height>
        <router-view />
      </v-container>
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
  }
</style>
