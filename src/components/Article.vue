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
      <!-- <v-text-field
        autofocus
        flat
        :value="title"
        label="Suche…"
        prepend-inner-icon="search"
        solo
        clearable
      /> -->
      <div class="article-xml mb-3" v-html="metaXML" />
      <!-- <div v-html="articleXML" class="" /> -->
      <v-expansion-panel expand>
        <v-expansion-panel-content>
          <div slot="header">Verbreitung</div>
          <v-card class="article-xml">
            <v-card-text class="pa-4" v-html="verbreitungXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
          <div slot="header">Belegauswahl</div>
          <v-card class="article-xml">
            <v-card-text class="pa-4" v-html="belegauswahlXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
          <div slot="header">Etymologie</div>
          <v-card class="article-xml">
            <v-card-text class="pa-4" v-html="etymologieXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
          <div slot="header">Bedeutung</div>
          <v-card class="article-xml">
            <v-card-text class="pa-4" v-html="bedeutungXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
          <div slot="header">Wortbildung</div>
          <v-card class="article-xml">
            <v-card-text class="pa-4" v-html="wortbildungXML" />
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <!-- <div class="article-xml" v-html="articleXML"> -->
    </v-flex>
  </v-layout>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getArticleByFileName, getArticles } from '../api'

@Component
export default class Article extends Vue {

  @Prop() file_name: string
  articles: Array<{text: string, value: string}> = []
  articleXML: string|null = ''

  title: string|null = null
  bedeutungXML: string|null = null
  verbreitungXML: string|null = null
  belegauswahlXML: string|null = null
  etymologieXML: string|null = null
  wortbildungXML: string|null = null
  metaXML: string|null = null

  loadArticle(e: string) {
    if (e.trim() !== '') {
      this.$router.push(`/articles/${e}`)
    } else {
      this.$router.push('/')
    }
  }

  fragementFromSelector(selector: string, body: string) {
    const elements = Array.from(this.elementsFromDom(selector, body))
    return elements.reduce((m, e) => m = m + e.outerHTML, '')
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

  async mounted() {
    this.articles = (await getArticles()).map(t => {
      return {
        text: t.title,
        value: t.file_name.replace('.xml', '')
      }
    })
    this.initArticle(this.file_name)
  }

  async initArticle(fileName: string) {
    this.articleXML = await getArticleByFileName(fileName + '.xml')
    // tslint:disable-next-line:max-line-length
    this.metaXML = this.fragementFromSelector('text > entry > form[type=lemma], text > entry > gramGrp, teiHeader title', this.articleXML)
    this.bedeutungXML = this.fragementFromSelector('text > entry > sense', this.articleXML)
    this.verbreitungXML = this.fragementFromSelector('text > entry > usg[type=geo]', this.articleXML)
    this.belegauswahlXML = this.fragementFromSelector('text > entry > form[type=variant]', this.articleXML)
    this.etymologieXML = this.fragementFromSelector('text > entry > etym', this.articleXML)
    this.wortbildungXML = this.fragementFromSelector('text > entry > re', this.articleXML)
    this.title = this.elementsFromDom('title', this.metaXML)[0].innerHTML
  }
}
</script>
<style lang="scss">
.article-xml {
  font-size: 120%;
  form {
    display: inline-block;
  }
  form[type="variant"] {
    display: block
  }
  title{
    margin-right: .5em;
    display: inline-block;
    font-size: 2.5em;
  }
  // counter-reset: roman-counter;
  // counter-reset: decimal-counter;
  // counter-reset: alpha-counter;
  cit quote {
    font-style: italic;
  }
  sense def{
    letter-spacing: .1em;
  }
  placename[xml\:id] {
    cursor: pointer;
    color: #003067;
    transition: .25s;
    &:hover{
      transform: translateY(-2px);
      text-decoration: underline;
    }
  }
  sense {
    margin-bottom: 1em;
    display: block;
    counter-increment: roman-counter;
    &::before{
      content: counter(roman-counter, upper-roman) ". "
    }
    sense {
      margin-bottom: 0;
      counter-increment: decimal-counter;
      &::before{
        content: counter(decimal-counter, decimal) ". "
      }
      display: inline-block;
      sense {
        margin-bottom: 0;
        display: inline-block;
        counter-increment: alpha-counter;
        &::before{
          content: counter(apha-counter, lower-alpha) ". "
        }
      }
    }
  }
}
</style>
