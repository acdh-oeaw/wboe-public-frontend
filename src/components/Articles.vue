<template>
  <v-layout column>
    <v-flex class="text-xs-center">
      <v-text-field
        :loading="loading"
        autofocus
        flat
        label="Suche…"
        prepend-inner-icon="search"
        solo
        clearable
      />
    </v-flex>
    <v-flex xs12>
      <v-list>
        <template v-for="(articles, i) in articlesByInitial">
          <v-subheader class="sticky" :key="'subheader' + i">{{ articles.initials }}</v-subheader>
          <v-list-tile :to="`/articles/${ article.filename.replace('.xml', '') }`" v-for="article in articles.articles" :key="article.title">
            <v-list-tile-title>
              {{ article.title }}
            </v-list-tile-title>
          </v-list-tile>
        </template>
      </v-list>
    </v-flex>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getArticles } from '../api'
import * as _ from 'lodash'

@Component
// tslint:disable:max-line-length
export default class Articles extends Vue {
  
  articles: Array<{ title: string, filename: string }> = []
  loading = false

  getCleanInitial(lemmaName: string) {
    return lemmaName.replace(/\(.*\)/g, '')[0].toUpperCase() + lemmaName.replace(/\(.*\)/g, '')[1].toLowerCase()
  }

  get articlesByInitial() {
    return _(this.articles)
      .groupBy((a) => this.getCleanInitial(a.title))
      .map((v, k) => {
        return { initials: k, articles: v }
      })
      .value()
      .sort((a, b) => a.initials.localeCompare(b.initials))
  }

  async mounted() {
    this.loading = true
    this.articles = await getArticles()
    this.loading = false
  }
}
</script>
<style lang="scss" scoped>
.sticky{
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
  border-bottom: 1px solid rgba(0,0,0,.12)
}
</style>
