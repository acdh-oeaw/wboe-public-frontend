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
        clearable
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
        <router-link class="word-cloud-link" :to="`/articles/${findArticleByTitle(text).file_name.replace('.xml', '')}`">
          {{ text }}
        </router-link>
      </template>
      </vue-word-cloud>
    </v-flex>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import * as _ from 'lodash'
import { getArticles } from '../api'

@Component
export default class Main extends Vue {

  wordProgress: number|null = null
  searchTerm: string = ''
  articles: Array<{title: string, file_name: string}> = []

  findArticleByTitle(title: string) {
    return this.articles.find(a => a.title === title)
  }

  get words(): string[] {
    return this.articles.map(w => w.title)
  }

  get wordsWithWeights(): Array<[string, number]> {
    return this.words.map((w: string) => {
      return [w, _.random(1, 5, true)] as [string, number]
    })
  }

  get filteredWords() {
    return this.wordsWithWeights.filter(w => {
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

  async mounted() {
    this.articles = await getArticles()
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
