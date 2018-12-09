<template>
  <v-layout column fill-height>
    <v-flex class="text-xs-center">
      <v-text-field
        :loading="loading"
        autofocus
        flat
        v-model="searchTerm"
        label="Suche…"
        prepend-inner-icon="search"
        solo
        clearable
      />
    </v-flex>
    <v-flex style="min-height: 400px" xs12>
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
        :animation-duration="searchTerm === '' ? ((visited) ? 0 : 5000) : 500"
        :spacing=".2"
        @update:progress="updateWordProgress"
        font-weight="800"
        font-family="HKGrotesk">
      <template slot-scope="{text, weight, word}">
        <router-link class="word-cloud-link" :to="`/articles/${findArticleByTitle(text).filename.replace('.xml', '')}`">
          {{ text }}
        </router-link>
      </template>
      </vue-word-cloud>
    </v-flex>
    <v-flex class="pt-4 pl-5 pr-5">
      <info-text path="lioe-start/einleitungstext/" />
    </v-flex>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import * as _ from 'lodash'
import InfoText from '@components/InfoText.vue'
import { getArticles } from '../api'

@Component({
  components: {
    InfoText
  }
})
export default class Main extends Vue {

  wordProgress: number|null = null
  searchTerm: string = ''
  articles: Array<{title: string, filename: string}> = []
  loading = false
  visited: boolean = false
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
    if (this.searchTerm) {
      return this.wordsWithWeights.filter(w => {
        return w[0].toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1
      })
    } else {
      return _(this.wordsWithWeights).sampleSize(25).value()
    }
  }

  updateWordProgress(e: any) {
    if (e !== null) {
      this.wordProgress = e.completedWords / e.totalWords * 100
    }
  }

  log(e: any) {
    console.log(e)
  }

  @Watch('$route')
  siteChanged(to: any, from: any) {
    if (from.path === '/') {
      this.visited = true
    }
  }

  async mounted() {
    this.loading = true
    this.articles = await getArticles()
    this.loading = false
  }
}
</script>
<style lang="scss" scoped>
.word-cloud-link{
  opacity: .6;
  color: #3B89A0;
  text-decoration: none;
  &:hover{
    opacity: 1;
  }
}
</style>
