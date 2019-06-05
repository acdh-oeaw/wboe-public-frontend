<template>
  <div class="pa-5 text-xs-center">
    <h1 class="text-light">Zugriffsgeschützter Bereich</h1>
    <p class="grey--text">
      Bitte geben Sie das Ihnen zugewiesene Passwort an.<br>
      Hinweise zu unserem Forschungsdatenmanagement finden Sie <a href="https://vawadioe.acdh.oeaw.ac.at/lioetxt/wboe-artikel/hinweise-zum-forschungsdatenmanagement/" target="_blank" @click.prevent="subDialog = true">hier</a>.<br>
      Bei Fragen wenden sie sich bitte an <a href="mailto:philipp.stoeckle@oeaw.ac.at">Dr. Philipp Stöckle</a>.
    </p>
    <v-form @submit.prevent="submit">
      <v-layout>
        <v-flex xs12>
          <v-text-field :error-messages="wrongPassword ? 'Passwort falsch.' : []" autofocus v-model="aospdqweumkyxclkqwe" placeholder="Password" type="password" required solo>
            <v-btn @click="submit" depressed color="accent" dark slot="append">ok</v-btn>
          </v-text-field>
        </v-flex>
        <v-flex>
        </v-flex>
      </v-layout>
    </v-form>
    <InfoBox>
      <h4 class="headline mb-0">Sie suchen das WBÖ-Projekt?</h4>
      <div>Alle Informationen zum „Wörterbuch der bairischen Mundarten in Österreich“ finden Sie <a href="https://vawadioe.acdh.oeaw.ac.at/projekte/wboe/wboe-startseite/" target="_blank">hier</a>.</div>
    </InfoBox>
    <v-dialog v-model="subDialog" max-width="1000" color="#2b2735" scrollable>
      <v-card flat class="fill-height pl-4 pt-4 pr-4 pb-3">
        <div class="close-btn">
          <v-btn @click="subDialog = false" flat icon><v-icon dark>close</v-icon></v-btn>
        </div>
        <v-card-text class="pa-0 fill-height">
          <info-text class="pa-4 white fill-height" path="wboe-artikel/hinweise-zum-forschungsdatenmanagement/" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { userStore } from '../store/user'
import InfoText from '@components/InfoText.vue'
import InfoBox from '@components/InfoBox.vue'

@Component({
  components: {
    InfoBox,
    InfoText
  }
})
export default class Password extends Vue {

  @Prop() initial_url: string
  adijweoqeoqkdkwoqkk = 'ZmxpZW5zY2hlbG4='
  adiuieuenslkfiwensd = 'ZmV1cmV0emVu'
  aospdqweumkyxclkqwe: string|null = null
  wrongPassword = false
  userStore = userStore
  subDialog = false
  submit() {
    if (this.aospdqweumkyxclkqwe !== null && (btoa(this.aospdqweumkyxclkqwe) === this.adijweoqeoqkdkwoqkk || btoa(this.aospdqweumkyxclkqwe) === this.adiuieuenslkfiwensd)) {
      this.userStore.isLoggedIn = true
      this.userStore.showComment = false
      this.userStore.articleStatus = 'proofed'
      if (btoa(this.aospdqweumkyxclkqwe) === this.adiuieuenslkfiwensd) {
        this.userStore.showPdfPrintButton = true
        this.userStore.showComment = true
        this.userStore.articleStatus = ''
      }
      if (this.initial_url) {
        this.$router.replace(this.initial_url)
      } else {
        this.$router.push('/')
      }
    } else {
      this.wrongPassword = true
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
