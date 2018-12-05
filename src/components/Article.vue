<template>
  <v-layout column>
    <v-flex xs12>
      <v-autocomplete
        label="Suche…"
        :value="{ text: title, value: file_name.replace('.xml', '')}"
        clearable
        solo
        flat
        @change="loadArticle"
        :items="articles"
        prepend-inner-icon="search"
      />
      <v-layout align-baseline>
        <v-flex class="article-xml mb-3" v-html="metaXML" xs12 />
        <v-flex>
          <v-btn small round flat @click="toggleAll">{{ isEveryArticleExpanded ? 'Einklappen' : 'Ausklappen'}}</v-btn>
        </v-flex>
        <v-flex class="text-xs-right">
          <v-dialog v-model="showEditor" max-width="1000" content-class="fill-height" color="#2b2735" scrollable>
            <v-btn small round flat slot="activator">XML/TEI</v-btn>
            <v-card color="#342f40" dark flat class="fill-height">
              <v-card-title class="pt-1 pb-1">
                <v-flex>
                  {{ file_name }}.xml
                </v-flex>
                <v-flex class="text-xs-right">
                  <v-btn small round flat>download</v-btn>
                  <v-btn small round flat @click="saveEditorXML">view</v-btn>
                </v-flex>
              </v-card-title>
              <v-card-text class="pa-0 fill-height">
                <xml-editor :show="showEditor" class="fill-height" v-model="articleXML" />
              </v-card-text>
            </v-card>
          </v-dialog>
        </v-flex>
      </v-layout>
      <v-expansion-panel @click.native="handleArticleClick" v-model="expanded" expand>
        <article-fragment info-url="?id=67" title="Verbreitung" :content="verbreitungXML" />
        <article-fragment info-url="?id=68" :content="belegauswahlXML" title="Belegauswahl" />
        <article-fragment info-url="?id=69" :content="etymologieXML" title="Etymologie" />
        <article-fragment info-url="?id=70" :content="bedeutungXML" title="Bedeutung" />
        <article-fragment info-url="?id=71" :content="wortbildungXML" title="Wortbildung" />
        <article-fragment info-url="?id=72" :content="redewendungenXML" title="Redewendungen" />
        <!-- <v-expansion-panel-content v-show="!isEmptyXML(belegauswahlXML)">
          <div slot="header">Belegauswahl</div>
          <v-card class="article-xml belegauswahl">
            <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="belegauswahlXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content v-show="!isEmptyXML(etymologieXML)">
          <div slot="header">Etymologie</div>
          <v-card class="article-xml etymologie">
            <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="etymologieXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content v-show="!isEmptyXML(bedeutungXML)">
          <div slot="header">Bedeutung</div>
          <v-card class="article-xml bedeutung">
            <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="bedeutungXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content v-show="!isEmptyXML(wortbildungXML)">
          <div slot="header">Wortbildung</div>
          <v-card class="article-xml wortbildung">
            <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="wortbildungXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content v-show="!isEmptyXML(redewendungenXML)">
          <div slot="header">Redewendungen</div>
          <v-card class="article-xml redewendungen">
            <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="redewendungenXML" />
          </v-card>
        </v-expansion-panel-content> -->
      </v-expansion-panel>
      <!-- <div class="article-xml" v-html="articleXML"> -->
    </v-flex>
  </v-layout>
</template>
<script lang="ts">

// tslint:disable:max-line-length
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getArticleByFileName, getArticles } from '../api'
import XmlEditor from '@components/XmlEditor.vue'
import { geoStore } from '../store/geo'
import * as _ from 'lodash'
import InfoText from '@components/InfoText.vue'
import ArticleFragment from '@components/ArticleFragment.vue'
@Component({
  components: {
    XmlEditor,
    InfoText,
    ArticleFragment
  }
})
export default class Article extends Vue {

  @Prop() file_name: string

  showEditor = false
  articles: Array<{text: string, value: string}> = []
  geoStore = geoStore

  expanded = [
    false,
    false,
    false,
    true,
    false,
    false
  ]

  articleXML: string|null = ''
  title: string|null = null
  bedeutungXML: string|null = null
  verbreitungXML: string|null = null
  belegauswahlXML: string|null = null
  etymologieXML: string|null = null
  wortbildungXML: string|null = null
  redewendungenXML: string|null = null
  metaXML: string|null = null

  getGrossregionFromGemeinde(sigle: string): string {
    if (geoStore.grossregionen !== null) {
      const s = sigle.split(/([a-z])/)[0]
      const g = geoStore.grossregionen.features.find((f) => {
        return f.properties!.Sigle === s
      })
      return g ? g.properties!.Grossreg : ''
    } else {
      return ''
    }
  }

  isPlaceNameElement(el: HTMLElement|any) {
    return el.nodeName === 'PLACENAME' && el.getAttribute('ref') !== null
  }

  getPlacenameSigleFromRef(ref: string|null): string|null {
    if (ref === null) {
      return null
    } else {
      return _.last(ref.split(/([#p])/))!
    }
  }

  handleArticleClick(e: MouseEvent) {
    if (this.isPlaceNameElement(e.target)) {
      const sigle = this.getPlacenameSigleFromRef((e.target as HTMLElement).getAttribute('ref'))
      if (sigle !== null) {
        this.openMapsWithPlaces([ sigle ])
      }
    }
  }

  openMapsWithPlaces(placeIds: string[]) {
    this.$router.push({ path: '/maps',  query: { loc: placeIds.join(',') } })
  }

  get isEveryArticleExpanded(): boolean {
    return _(this.expanded).every(x => x)
  }

  toggleAll() {
    this.expanded = this.expanded.map(() => !this.isEveryArticleExpanded)
  }

  loadArticle(e: string) {
    if (e.trim() !== '') {
      this.$router.push(`/articles/${e}`)
    } else {
      this.$router.push('/')
    }
  }

  isEmptyXML(xml: string): boolean {
    const d = document.createElement('div')
    d.innerHTML = xml
    return d.innerText.trim() === ''
  }

  fragementFromSelector(selector: string, body: string, contains?: string) {
    const elements = Array.from(this.elementsFromDom(selector, body))
    if (contains !== undefined) {
      return elements
        .filter(e => e.querySelectorAll(contains).length > 0)
        .reduce((m, e) => m = m + e.outerHTML, '')
    } else {
      return elements.reduce((m, e) => m = m + e.outerHTML, '')
    }
  }

  elementsFromDom(selector: string, body: string) {
    const dom = document.createElement('div')
    dom.innerHTML = body
    return dom.querySelectorAll(selector)
  }

  @Watch('file_name')
  onFileChange() {
    this.initArticle(this.file_name)
  }

  saveEditorXML() {
    this.showEditor = false
    this.initXML(this.articleXML!)
  }

  async mounted() {
    this.articles = (await getArticles()).map(t => {
      return {
        text: t.title,
        value: t.file_name.replace('.xml', '')
      }
    })
    this.initArticle(this.file_name)
  }

  appendGrossregionViaRef(selector: string, xml: string) {
    const e = document.createElement('div')
    e.innerHTML = xml
    Array.from(e.querySelectorAll(selector)).forEach((v, i) => {
      const sigle = this.getPlacenameSigleFromRef(v.getAttribute('ref'))
      if (sigle !== null) {
        const grossregion = document.createElement('grossregion')
        grossregion.innerHTML = this.getGrossregionFromGemeinde(sigle)
        v.appendChild(grossregion)
      }
    })
    return e.innerHTML
  }

  initXML(xml: string) {
    xml = this.appendGrossregionViaRef('form[type=variant] placename[type=gemeinde], cit placename[type=gemeinde]', xml)
    this.metaXML = this.fragementFromSelector('text > entry > form[type=lemma], text > entry > form[subtype=diminutive], text > entry > gramGrp', xml)
    this.bedeutungXML = this.fragementFromSelector('text > entry > sense', xml)
    this.verbreitungXML = this.fragementFromSelector('text > entry > usg[type=geo]', xml)
    this.belegauswahlXML = this.fragementFromSelector('text > entry > form[type=variant]:not([subtype])', xml)
    this.etymologieXML = this.fragementFromSelector('text > entry > etym', xml)
    this.wortbildungXML = this.fragementFromSelector('text > entry > re', xml, '[subtype=compound]')
    this.redewendungenXML = this.fragementFromSelector('text > entry > re', xml, '[subtype=MWE]')
    this.title = this.elementsFromDom('title', this.metaXML)[0].innerHTML
  }

  async initArticle(fileName: string) {
    this.articleXML = await getArticleByFileName(fileName + '.xml')
    this.initXML(this.articleXML)
  }
}
</script>
