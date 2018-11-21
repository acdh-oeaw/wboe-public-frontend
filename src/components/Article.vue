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
      <div class="article-xml mb-3" v-html="metaXML" />
      <!-- <div v-html="articleXML" class="" /> -->
      <v-expansion-panel expand>
        <v-expansion-panel-content :disabled="isEmpty(verbreitungXML)">
          <div slot="header">Verbreitung</div>
          <v-card class="article-xml">
            <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="verbreitungXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content :disabled="isEmpty(belegauswahlXML)">
          <div slot="header">Belegauswahl</div>
          <v-card class="article-xml belegauswahl">
            <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="belegauswahlXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content :disabled="isEmpty(etymologieXML)">
          <div slot="header">Etymologie</div>
          <v-card class="article-xml etymologie">
            <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="etymologieXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content :disabled="isEmpty(bedeutungXML)">
          <div slot="header">Bedeutung</div>
          <v-card class="article-xml bedeutung">
            <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="bedeutungXML" />
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content :disabled="isEmpty(wortbildungXML)">
          <div slot="header">Wortbildung</div>
          <v-card class="article-xml wortbildung">
            <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="wortbildungXML" />
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

  isEmpty(xml: string) {
    const d = document.createElement('div')
    d.innerHTML = xml
    return d.innerText.trim() === ''
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
    // tslint:disable-next-line:max-line-length
    this.belegauswahlXML = this.fragementFromSelector('text > entry > form[type=variant]:not([subtype])', this.articleXML)
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
    display: inline-block;
    margin-right: .25em;
  }
  title{
    margin-right: .5em;
    display: inline-block;
    font-size: 2.5em;
  }
  cit quote {
    font-style: italic;
  }
  sense def{
    letter-spacing: .075em;
    &::before{
      content: "'"
    }
    &::after{
      content: "'"
    }
  }
  placename[xml\:id] {
    cursor: pointer;
    transition: .25s;
    background: #f4f4f4;
    display: inline-block;
    padding: 0 9px;
    border-radius: 14px;
    font-size: .85em;
    &[type=bundesland]{
      background: aliceblue;
    }
    &[type=grossregion]{
      background: darken(aliceblue, $amount: 3)
    }
    &[type=gemeinde]{
      background: darken(aliceblue, $amount: 6)
    }
    &:hover{
      transform: translateY(-2px);
      background: darken(aliceblue, $amount: 2)
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
  &.wortbildung{
    re{
      display: block;
      margin-bottom: .25em;
    }
    form{
      font-style: italic;
      margin-right: .5em;
    }
    sense{
      margin-bottom: 0;
      display: inline-block;
      sense {
        margin-left: 0;
        sense {
          margin-left: 0;
        }
      }
    }
  }
  &.etymologie{
    cit{
      form{
        font-style: italic;
      }
    }
    ref[type="bibl"]{
      &::before{
        margin-right: -.25em;
        content: "("
      }
      &::after{
        margin-left: -.25em;
        content: ")"
      }
      citedrange::before{
        content: ":";
        margin-left: -.25em;
        margin-right: .25em;
      }
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
      margin-left: 1.5em;
      margin-bottom: 0;
      counter-increment: decimal-counter;
      &:not(:only-of-type)::before{
        font-weight: 700;
        content: counter(decimal-counter, decimal) ". "
      }
      display: inline-block;
      sense {
        margin-left: 0;
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
