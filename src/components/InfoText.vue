<template>
  <div class="pa-2 mb-2 grey--text text-xs-center" v-if="error">
    could not load {{ path }}.
  </div>
  <div class="info-text" v-else>
    <slot />
    <div class="pa-2 grey--text text-xs-center" v-if="html === ''">
      <v-icon>code</v-icon> <br> "{{ path }}" is empty
    </div>
    <div v-if="subHtml !== null && !subDialog">
      <div><v-btn @click="subHtml = null" flat small><v-icon small>arrow_back</v-icon> Zurück</v-btn></div>
      <div ref="infoContent" v-html="subHtml" />
      <div><v-btn @click="subHtml = null" flat small><v-icon small>arrow_back</v-icon> Zurück</v-btn></div>
    </div>
    <div ref="infoContent" v-html="html" v-else/>
    <v-dialog v-model="showSubDialog" max-width="1000" color="#2b2735" scrollable v-if="subDialog">
      <v-card flat class="fill-height pa-4">
        <div class="close-btn">
          <v-btn @click="showSubDialog = false" flat icon><v-icon dark>close</v-icon></v-btn>
        </div>
        <v-card-text class="pa-0 fill-height">
          <info-text class="pa-4 white fill-height" :path="subUrl" v-if="subUrl" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getWebsiteHtml, isExternUrl } from '../api'

@Component

export default class InfoText extends Vue {
  @Prop({ default: null }) path: string|null
  @Prop({ default: false }) subDialog: boolean

  html: string|null = null
  subHtml: string|null = null
  subUrl: string|null = null
  showSubDialog: boolean = false
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
              if (this.subDialog) {
                this.subUrl = e.target.href
                this.showSubDialog = true
              } else {
                this.subHtml = await getWebsiteHtml(e.target.href)
              }
            }
          }
        })
      }, this)
    })
  }

  @Watch('showSubDialog')
  ssdChanged(nVal: boolean) {
    if (!nVal) {
      this.subUrl = null
    }
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
.close-btn {
  position: absolute;
  right: 0;
}
div /deep/ .frame > p:last-child {
  margin-bottom: 0;
}
.info-text{
  max-width: 60em;
  margin-left: auto;
  margin-right: auto;
}
div /deep/ a{
  text-decoration: none;
}
</style>
