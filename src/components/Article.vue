<template>
  <v-layout column>
    <v-flex xs12>
      <v-autocomplete
        label="Suche…"
        :value="{ text: title, value: filename.replace('.xml', '')}"
        :loading="loading"
        clearable
        solo
        flat
        @change="loadArticle"
        :items="articles"
        prepend-inner-icon="search"
      />
      <v-layout align-baseline>
        <v-flex @click="handleArticleClick" class="article-xml mb-3" v-html="metaXML" xs12 />
        <v-flex>
          <v-btn small round flat @click="toggleAll">
            {{ isEveryArticleExpanded ? 'Einklappen' : 'Ausklappen'}}
          </v-btn>
        </v-flex>
        <v-flex class="text-xs-right">
          <v-dialog transition="none" v-model="showEditor" max-width="1000" content-class="fill-height" color="#2b2735" scrollable>
            <v-btn small round flat slot="activator">XML/TEI</v-btn>
            <v-card color="#342f40" dark flat class="fill-height">
              <v-card-title class="pt-1 pb-1">
                <v-flex>
                  {{ filename }}
                </v-flex>
                <v-flex class="text-xs-right">
                  <v-btn class="pl-3 pr-3" small round flat @click="downloadEditorXML">download</v-btn>
                  <v-btn small round flat @click="saveEditorXML">view</v-btn>
                </v-flex>
              </v-card-title>
              <v-card-text class="pa-0 fill-height">
                <xml-editor v-if="showEditor" :show="showEditor" class="fill-height" v-model="articleXML" />
              </v-card-text>
            </v-card>
          </v-dialog>
        </v-flex>
      </v-layout>
      <v-expansion-panel @click.native="handleArticleClick" v-model="expanded" expand>
        <article-fragment ext-info-url="wboe-artikel/verbreitung/" info-url="wboe-artikel/verbreitung-short/" :content="verbreitungXML" title="Verbreitung" />
        <article-fragment ext-info-url="wboe-artikel/belegauswahl/" info-url="wboe-artikel/belegauswahl-short/" :content="belegauswahlXML" title="Belegauswahl" />
        <article-fragment ext-info-url="wboe-artikel/etymologie/" info-url="wboe-artikel/etymologie-short/" :content="etymologieXML" title="Etymologie" />
        <article-fragment ext-info-url="wboe-artikel/bedeutung/" info-url="wboe-artikel/bedeutung-short/" :content="bedeutungXML" title="Bedeutung" />
        <article-fragment ext-info-url="wboe-artikel/wortbildung/" info-url="wboe-artikel/wortbildung-short/" :content="wortbildungXML" title="Wortbildung" />
        <article-fragment
          ext-info-url="wboe-artikel/redewendungen/"
          info-url="wboe-artikel/redewendungen-short/"
          :content="redewendungenXML"
          title="Redewendungen"
          class="redewendungen"
        />
      </v-expansion-panel>
      <div class="text-xs-right pa-4">
        <v-tooltip top color="ci">
          <span slot="activator">{{ editor.initials ? editor.initials : editor.fullname }}</span>
          <span>{{ editor.fullname }}</span>
        </v-tooltip>
      </div>
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
import * as FileSaver from 'file-saver'

@Component({
  components: {
    XmlEditor,
    InfoText,
    ArticleFragment
  }
})
export default class Article extends Vue {

  @Prop() filename: string

  showEditor = false
  articles: Array<{text: string, value: string}> = []
  geoStore = geoStore
  loading = false
  editor = {
    initials: '',
    fullname: ''
  }
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

  getGrossregionFromGemeinde(sigle: string): string|null {
    if (geoStore.grossregionen !== null) {
      const s = sigle.split(/([a-z])/)[0]
      const g = geoStore.grossregionen.features.find((f) => {
        return f.properties!.Sigle === s
      })
      return g ? g.properties!.Grossreg : null
    } else {
      return null
    }
  }

  isPlaceNameElement(el: HTMLElement|any) {
    return el.nodeName === 'PLACENAME' && el.hasAttribute('ref')
  }

  getPlacenameSigleFromRef(ref: string|null): string|null {
    if (ref === null) {
      return null
    } else {
      return _.last(ref.split(/([#p])/)) || null
    }
  }

  getCollectionLink(el: HTMLElement|any): string|null {
    return el.getAttribute('collection-href') || el.parentElement.getAttribute('collection-href')
  }

  handleArticleClick(e: MouseEvent) {
    if (this.isPlaceNameElement(e.target)) {
      const sigle = this.getPlacenameSigleFromRef((e.target as HTMLElement).getAttribute('ref'))
      if (sigle !== null) {
        this.openMapsWithPlaces([ sigle ])
      }
    } else if (this.getCollectionLink(e.target) !== null) {
      const id = this.getCollectionLink(e.target)!
      this.$router.push({ path: '/db', query: { collection_ids: id } })
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
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(body, 'text/xml')
    return xmlDoc.querySelectorAll(selector)
  }

  @Watch('filename')
  onFileChange() {
    this.initArticle(this.filename)
  }

  saveEditorXML() {
    this.showEditor = false
    this.initXML(this.articleXML!)
  }

  downloadEditorXML() {
    const blob = this.articleXML
    FileSaver.saveAs(new Blob([blob]), this.filename + '.xml')
  }

  async mounted() {
    this.articles = (await getArticles()).map(t => {
      return {
        text: t.title,
        value: t.filename.replace('.xml', '')
      }
    })
    this.initArticle(this.filename)
  }

  linkParentsToCollection(selector: string, xml: string) {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, 'text/xml')
    Array.from(xmlDoc.querySelectorAll(selector)).forEach((v, i) => {
      const p = v.parentElement
      const href = v.getAttribute('target') ? _.last(v.getAttribute('target')!.split('#c')) : null
      if (p !== null && p.firstElementChild !== null && href !== null && href !== undefined) {
        p.firstElementChild.setAttribute('collection-href', href)
      }
      v.remove()
    })
    const s = new XMLSerializer()
    return s.serializeToString(xmlDoc)
  }

  appendGrossregionViaRef(selector: string, xml: string) {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, 'text/xml')
    Array.from(xmlDoc.querySelectorAll(selector)).forEach((v, i) => {
      const sigle = this.getPlacenameSigleFromRef(v.getAttribute('ref'))
      if (sigle !== null) {
        const reg = this.getGrossregionFromGemeinde(sigle)
        if (reg !== null) {
          const grossregion = document.createElement('grossregion')
          grossregion.innerHTML = reg
          v.appendChild(grossregion)
        }
      }
    })
    const s = new XMLSerializer();
    return s.serializeToString(xmlDoc)
  }

  initXML(xml: string) {
    xml = xml.split('<body>').join('').split('</body>').join('')
    xml = this.linkParentsToCollection('ptr[type=collection]', xml)
    xml = this.appendGrossregionViaRef('form[type=dialect] placeName[type=gemeinde], cit placeName[type=gemeinde]', xml)
    this.metaXML = this.fragementFromSelector('entry > form[type=lemma], entry > form[subtype=diminutive], entry > gramGrp', xml)
    console.log({meta: this.metaXML})
    this.bedeutungXML = this.fragementFromSelector('entry > sense', xml)
    this.verbreitungXML = this.fragementFromSelector('entry > usg[type=geo]', xml)
    this.belegauswahlXML = this.fragementFromSelector('entry > form[type=dialect]:not([subtype])', xml)
    this.etymologieXML = this.fragementFromSelector('entry > etym', xml)
    this.wortbildungXML = this.fragementFromSelector('entry > re', xml, '[subtype=compound]')
    this.redewendungenXML = this.fragementFromSelector('entry > re', xml, '[subtype=MWE]')
    this.title = this.elementsFromDom('title', xml)[0].innerHTML
    const aEditor = this.elementsFromDom('teiHeader > fileDesc > titleStmt > respStmt > name[ref]', xml)[0]
    let aInitials = aEditor.getAttribute('ref')
    aInitials = typeof aInitials === 'string' ? aInitials.substr(1) : ''
    this.editor = {
      initials: aInitials,
      fullname: aEditor.innerHTML
    }
  }

  async initArticle(fileName: string) {
    this.loading = true
    this.articleXML = await getArticleByFileName(fileName + '.xml')
    this.initXML(this.articleXML)
    this.loading = false
  }
}
</script>
<style lang="scss">
.wortbildung, .redewendungen{
  re{
    display: block;
    margin-bottom: 1em;
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
  form{
    font-style: italic;
    margin-right: .5em;
  }
}
</style>
