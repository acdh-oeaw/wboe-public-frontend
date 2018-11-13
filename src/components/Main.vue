<template>
  <v-layout column>
    <v-flex class="text-xs-center">
      <v-text-field
        autofocus
        flat
        v-model="searchTerm"
        label="Suche…"
        prepend-inner-icon="search"
        solo
      ></v-text-field>
    </v-flex>
    <v-flex xs12>
      <!-- <v-progress-linear
        height="1"
        class="pa-0 ma-0 absolute"
        v-if="wordProgress !== null && wordProgress !== 100"
        indeterminate
      /> -->
      <vue-word-cloud
        :enter-animation="{ opacity: 0, transform: 'scale3d(0.3, 1, 0.3)' }"
        :rotation="searchTerm === '' ? .875 : 0"
        :words="filteredWords"
        :animation-overlap="searchTerm === '' ? 10 : 1"
        :animation-duration="searchTerm === '' ? 5000 : 500"
        :spacing=".2"
        @update:progress="updateWordProgress"
        font-weight="800"
        font-family="HKGrotesk">
      <template slot-scope="{text, weight, word}">
        <router-link class="word-cloud-link" :to="`/lemma/${text}`">
          {{ text }}
        </router-link>
      </template>
      </vue-word-cloud>
    </v-flex>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import * as randomWords from 'random-words'
import * as _ from 'lodash'

@Component
export default class Main extends Vue {

  wordProgress: number|null = null
  searchTerm: string = ''

  words: Array<[string, number]> = randomWords(50).map((w: string) => {
    return [w, _.random(1, 5, true)]
  })

  get filteredWords() {
    return this.words.filter(w => {
      return w[0].toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1
    })
  }

  updateWordProgress(e: any) {
    if (e !== null) {
      this.wordProgress = e.completedWords / e.totalWords * 100
    }
  }

  log(e: any) {
    console.log(e)
  }
  mounted() {
    console.log('hello')
  }
}
</script>
<style lang="scss" scoped>
.word-cloud-link{
  opacity: .6;
  color: #285495;
  text-decoration: none;
  &:hover{
    opacity: 1;
  }
}
</style>
