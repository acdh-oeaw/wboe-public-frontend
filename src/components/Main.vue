<template>
  <v-app>
    <v-content>
      <v-container fluid fill-height>
        <v-layout
          justify-center
          align-center>
          <v-flex class="text-xs-center">
            <h1>LiÖ</h1>
            <h2>WBÖ</h2>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class Main extends Vue {
  @Prop() prop: string|null
  mounted() {
    
  }
}
</script>

<style>
  @import 'https://fonts.googleapis.com/icon?family=Material+Icons';
  @import '../../node_modules/vuetify/dist/vuetify.min.css';
  @import '/static/css/materialdesignicons.min.css';
  @import '../styles/fonts.scss';
  @import '../styles/global.scss';
</style>
