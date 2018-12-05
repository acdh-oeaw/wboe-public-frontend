<template>
  <div v-html="html" />
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getWebsiteHtml } from '../api'

@Component

export default class InfoText extends Vue {  
  @Prop({ default: null }) path: string|null

  html: string|null = null

  async mounted() {
    console.log('mounted!')
    if (this.path !== null) {
      this.html = await getWebsiteHtml(this.path)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
