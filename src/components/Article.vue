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
        <v-expansion-panel-content :disabled="isEmptyXML(verbreitungXML)">
          <v-layout slot="header">
            <v-flex xs12>
              <!-- <v-tooltip top>
                <v-icon small class="mr-1" slot="activator">info_outline</v-icon>
                <span>Lorem ipsum dolor sit, amet consectetur adipisicing elit. In consectetur sapiente quidem reiciendis, a dolor? Fuga placeat soluta perferendis error fugiat ducimus vero, aut provident sint facere tempore dignissimos. Vel.</span>
              </v-tooltip> -->
              Verbreitung
            </v-flex>
            <v-flex>
              <v-tooltip top>
                <v-icon class="mr-3" slot="activator">info_outline</v-icon>
                <span>Lorem ipsum dolor sit, amet consectetur adipisicing elit. In consectetur sapiente quidem reiciendis, a dolor? Fuga placeat soluta perferendis error fugiat ducimus vero, aut provident sint facere tempore dignissimos. Vel.</span>
              </v-tooltip>
            </v-flex>
          </v-layout>
          <v-card class="article-xml">
            <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="verbreitungXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content :disabled="isEmptyXML(belegauswahlXML)">
          <div slot="header">Belegauswahl</div>
          <v-card class="article-xml belegauswahl">
            <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="belegauswahlXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content :disabled="isEmptyXML(etymologieXML)">
          <div slot="header">Etymologie</div>
          <v-card class="article-xml etymologie">
            <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="etymologieXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content :disabled="isEmptyXML(bedeutungXML)">
          <div slot="header">Bedeutung</div>
          <v-card class="article-xml bedeutung">
            <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="bedeutungXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content :disabled="isEmptyXML(wortbildungXML)">
          <div slot="header">Wortbildung</div>
          <v-card class="article-xml wortbildung">
            <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="wortbildungXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content :disabled="isEmptyXML(redewendungenXML)">
          <div slot="header">Redewendungen</div>
          <v-card class="article-xml redewendungen">
            <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="redewendungenXML" />
          </v-card>
        </v-expansion-panel-content>
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

@Component({
  components: {
    XmlEditor
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

  getPlacenameSigleFromRef(ref: string): string {
    return _.last(ref.split(/([#p])/))!
  }

  handleArticleClick(e: MouseEvent) {
    if (this.isPlaceNameElement(e.target)) {
      this.openMapsWithPlaces([
        this.getPlacenameSigleFromRef((e.target as HTMLElement).getAttribute('ref')!)
      ])
    }
  }

  openMapsWithPlaces(placeIds: string[]) {
    this.$router.push({ path: '/maps',  query: { loc: placeIds.join(',') } })
  }

  get isEveryArticleExpanded() {
    return this.expanded.find(x => x) !== undefined
  }

  toggleAll() {
    if (this.isEveryArticleExpanded) {
      this.expanded = this.expanded.map(_ => false)
    } else {
      this.expanded = this.expanded.map(_ => true)
    }
  }

  loadArticle(e: string) {
    if (e.trim() !== '') {
      this.$router.push(`/articles/${e}`)
    } else {
      this.$router.push('/')
    }
  }

  isEmptyXML(xml: string) {
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
      const grossregion = document.createElement('grossregion')
      const sigle = this.getPlacenameSigleFromRef(v.getAttribute('ref') || '')
      grossregion.innerHTML = this.getGrossregionFromGemeinde(sigle)
      v.appendChild(grossregion)
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

<style lang="scss">
.article-xml {
  font-size: 115%;
  form {
    display: inline-block;
  }
  form[type="variant"] {
    display: inline-block;
    margin-right: .25em;
    &[subtype="diminutive"] orth{
      font-style: italic
    }
  }
  gram[type="gender"] {
    &::before{
      content: '(';
    }
    &::after{
      content: ')';
    }
  }
  > form[type="lemma"] orth{
    margin-right: .5em;
    display: inline-block;
    font-size: 2.5em;
  }
  cit quote {
    &::before{
      content: "— "
    }
    font-style: italic;
  }
  def{
    letter-spacing: .075em;
    &::before{
      content: "'"
    }
    &::after{
      content: "'"
    }
  }
  cit, form[type=variant] {
    usg[type=geo] {
      &:first-of-type::before {
        opacity: .6;
        margin-right: -.25em;
        display: inline;
        content: '('
      }
      &:last-of-type::after {
        opacity: .6;
        margin-left: -.25em;
        content: ')'
      }
      grossregion::before{
        content: ', '
      }
    }
  }
  usg[type=geo] {
    &:last-of-type placename{
      &:last-child{
        &::after{
          display: none;
        }
      }
    } 
  }
  placename[ref] {
    cursor: pointer;
    display: inline-block;
    opacity: .6;
    &[type=bundesland]{
      &::after{
        content: ';'
      }
    }
    &[type=grossregion]{
      &::after{
        content: ','
      }
    }
    &[type=gemeinde]{
      &::after{
        content: ','
      }
    }
    &:hover{
      text-decoration: underline
    }
  }
  &.belegauswahl{
    pron{
      font-style: italic;
    }
    form:not(:last-child)::after{
      content: ',';
      margin-left: -.25em;
    }
  }
  &.wortbildung, &.redewendungen{
    re{
      display: block;
      margin-bottom: .25em;
    }
    form{
      font-style: italic;
      margin-right: .5em;
    }
    sense{
      display: inline;
      sense {
        margin-left: 0;
        sense {
          margin-left: 0;
        }
      }
    }
  }
  cit{
    form{
      font-style: italic;
    }
  }
  ref[type="bibl"]{
    font-variant: small-caps;
    * {
      font-variant: normal;
    }
    &::before {
      content: "("
    }
    &::after {
      content: ")"
    }
    &>*:last-child {
      margin-right: -.25em
    }
    &>*:first-child {
      margin-left: -.25em
    }
    citedrange::before{
      content: ":";
      margin-left: -.25em;
      margin-right: .25em;
    }
  }
  sense {
    margin-bottom: 1em;
    display: block;
    counter-increment: roman-counter;
    &:not(:only-of-type)::before{
      font-weight: 700;
      content: counter(roman-counter, upper-roman) ". "
    }
    sense {
      counter-increment: decimal-counter;
      &:not(:only-of-type)::before{
        font-weight: 700;
        content: counter(decimal-counter, decimal) ". "
      }
      display: inline;
      sense {
        display: inline;
        counter-increment: alpha-counter;
        &:not(:only-of-type)::before{
          font-weight: 700;
          content: counter(alpha-counter, lower-alpha) ") "
        }
      }
    }
  }
}
</style>
