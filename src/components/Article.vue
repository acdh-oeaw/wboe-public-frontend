<template>
  <div>
    <h1>{{ file_name }}</h1>
    <div v-html="articleXML">
    </div>
  </div>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getArticleByFileName } from '../api'

@Component
export default class Article extends Vue {

  @Prop() file_name: string
  articleXML: string|null = ''

  async mounted() {
    console.log(this.file_name)
    this.articleXML = await getArticleByFileName(this.file_name)
  }
}
</script>
<style lang="scss" scoped>
</style>
