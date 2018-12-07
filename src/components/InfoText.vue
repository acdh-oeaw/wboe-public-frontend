<template>
  <div v-if="subHtml">
    <div><v-btn @click="subHtml = null" flat small><v-icon small>arrow_back</v-icon> Zurück</v-btn></div>
    <div ref="infoContent" v-html="subHtml" />
    <div><v-btn @click="subHtml = null" flat small><v-icon small>arrow_back</v-icon> Zurück</v-btn></div>
  </div>
  <div ref="infoContent" v-html="html" v-else/>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getWebsiteHtml, isExternUrl } from '../api'

@Component

export default class InfoText extends Vue {
  @Prop({ default: null }) path: string|null

  html: string|null = null
  subHtml: string|null = null

  @Watch('html')
  @Watch('subHtml')
  htmlChanged() {
    Vue.nextTick(() => {
      let aIcHtml: any = this.$refs['infoContent']
      let aThis: any = this
      aIcHtml.querySelectorAll('a').forEach(function (aLnk: any) {
        aLnk.addEventListener('click', async function(e: any) {
          if (e.target && e.target.href) {
            e.preventDefault();
            if (isExternUrl(e.target.href)) {
              window.open(e.target.href, "_blank")
            } else {
              aThis.subHtml = await getWebsiteHtml(e.target.href)
            }
          }
        })
      }, this)
    })
  }

  async mounted() {
    console.log('mounted!')
    if (this.path !== null) {
      this.html = await getWebsiteHtml(this.path)
      this.htmlChanged()
    }
  }
}
</script>
<style lang="scss" scoped>
  div /deep/ .frame > p:last-child {
    margin-bottom: 0;
  }
</style>
