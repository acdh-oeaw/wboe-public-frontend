<template>
  <div>
    <div class="pa-2 mb-2 grey--text text-xs-center" v-if="error">
      could not load {{ path }}.
    </div>
    <div class="info-text" v-else>
      <slot />
      <div class="pa-2 grey--text text-xs-center" v-if="html === ''">
        <v-icon>code</v-icon> <br> "{{ path }}" is empty
      </div>
      <div v-if="subHtml !== null && !subDialog">
        <div>
          <v-btn @click="subHtml = null" flat small><v-icon small>arrow_back</v-icon> Zurück</v-btn>
        </div>
        <div ref="infoContent" v-html="subHtml" />
        <div>
          <v-btn @click="subHtml = null" flat small><v-icon small>arrow_back</v-icon> Zurück</v-btn>
        </div>
      </div>
      <div
        v-else
        v-html="html"
        ref="infoContent"
        :style="lines && !expanded ? {height: (lines * 1.6) + 'em', overflow: 'hidden'} : {}"
      />
      <div class="text-xs-center" v-if="lines !== null">  
        <v-btn color="primary" @click="expanded = !expanded" flat round>
          <span v-if="!expanded">Mehr</span>
          <span v-else>Weniger</span>
          &nbsp;anzeigen
        </v-btn>
      </div>
      <div class="pt-3" v-if="showLinkList && links.length">
        <h3>Weiterführend</h3>
        <ul class="mt-3 pl-4">
          <li v-for="link in links" :key="link.link">
            <a @click.prevent="interalLink(link.link)" :href="link.link">{{ link.text }}</a>
          </li>
        </ul>
      </div>
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
      </div>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getWebsiteHtml, isExternUrl, isLocalUrl } from '../api'

@Component

export default class InfoText extends Vue {

  @Prop({ default: null }) path: string|null
  @Prop({ default: false }) subDialog: boolean
  @Prop({ default: false }) linkList: boolean|string
  @Prop({ default: null }) lines: number|null

  expanded = false
  html: string|null = null
  subHtml: string|null = null
  subUrl: string|null = null
  showSubDialog: boolean = false
  error = false
  prefix = 'https://vawadioe.acdh.oeaw.ac.at/lioetxt/'

  interalLink(l: string) {
    const link = l.replace(this.prefix, '')
    this.$router.push({ path: '/resources', query: { link } })
  }

  get showLinkList() {
    return this.linkList === '' || this.linkList === true
  }

  get links() {
    if (this.html !== null) {
      const e = document.createElement('div')
      e.innerHTML = this.html
      console.log(e)
      return Array.from(e.querySelectorAll(`a[href^="${ this.prefix }"]`))
        .map((v) => {
          console.log(v)
          return {
            text: v.textContent,
            link: v.getAttribute('href')
          }
        })
    } else {
      return []
    }
  }

  @Watch('html')
  @Watch('subHtml')
  htmlChanged() {
    Vue.nextTick(() => {
      const aIcHtml: any = this.$refs['infoContent']
      aIcHtml.querySelectorAll('a').forEach((aLnk: any) => {
        aLnk.addEventListener('click', async (e: any) => {
          if (e.target && e.target.href) {
            e.preventDefault()
            let iLU = isLocalUrl(e.target.href)
            if (iLU) {
              this.$router.push(iLU)
            } else if (isExternUrl(e.target.href)) {
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

  maybeExpand() {
    this.lines = null
  }

  @Watch('path')
  async init() {
    if (this.path !== null) {
      try {
        this.html = await getWebsiteHtml(this.path)
        this.htmlChanged()
      } catch (e) {
        this.error = true
      }
    }
  }

  async mounted() {
    this.init()
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
  max-width: 47.5em;
  margin-left: auto;
  margin-right: auto;
}
div /deep/ a{
  text-decoration: none;
}
</style>
