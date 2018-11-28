<template>
  <v-list>
    <template v-for="(articles, initial) in articlesByInitial">
      <v-subheader :key="'subheader' + initial">{{ initial }}</v-subheader>
      <v-divider :key="'divider' + initial"/>
      <v-list-tile :to="`/articles/${ article.file_name.replace('.xml', '') }`" v-for="article in articles" :key="article.title">
        <v-list-tile-title>
          {{ article.title }}
        </v-list-tile-title>
      </v-list-tile>
    </template>
  </v-list>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getArticles } from '../api'
import * as _ from 'lodash'

@Component
// tslint:disable:max-line-length
export default class Articles extends Vue {
  articles: Array<{ title: string, file_name: string }> = []

  getCleanInitial(lemmaName: string) {
    return lemmaName.replace(/\(.*\)/g, '')[0].toUpperCase()
  }

  get articlesByInitial() {
    return _(this.articles)
      .orderBy((a) => this.getCleanInitial(a.title))
      .groupBy((a) => this.getCleanInitial(a.title))
      .value()
  }

  async mounted() {
    this.articles = await getArticles()
  }
}
</script>
