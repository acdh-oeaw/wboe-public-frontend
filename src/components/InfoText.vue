<template>
  <div class="pa-3 mb-2 grey--text text-xs-center" v-if="error">
    could not load {{ path }}.
  </div>
  <div v-else>
    <div v-if="subHtml !== null">
      <div><v-btn @click="subHtml = null" flat small><v-icon small>arrow_back</v-icon> Zurück</v-btn></div>
      <div ref="infoContent" v-html="subHtml" />
      <div><v-btn @click="subHtml = null" flat small><v-icon small>arrow_back</v-icon> Zurück</v-btn></div>
    </div>
    <div ref="infoContent" v-html="html" v-else/>
  </div>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getWebsiteHtml, isExternUrl } from '../api'

@Component

export default class InfoText extends Vue {
  @Prop({ default: null }) path: string|null

  html: string|null = null
  subHtml: string|null = null
  error = false

  @Watch('html')
  @Watch('subHtml')
  htmlChanged() {
    Vue.nextTick(() => {
      const aIcHtml: any = this.$refs['infoContent']
      aIcHtml.querySelectorAll('a').forEach((aLnk: any) => {
        aLnk.addEventListener('click', async (e: any) => {
          if (e.target && e.target.href) {
            e.preventDefault()
            if (isExternUrl(e.target.href)) {
              window.open(e.target.href, '_blank')
            } else {
              this.subHtml = await getWebsiteHtml(e.target.href)
            }
          }
        })
      }, this)
    })
  }

  async mounted() {
    console.log('mounted!')
    if (this.path !== null) {
      try {
        this.html = await getWebsiteHtml(this.path)
        this.htmlChanged()
      } catch (e) {
        this.error = true
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  div /deep/ .frame > p:last-child {
    margin-bottom: 0;
  }
</style>
