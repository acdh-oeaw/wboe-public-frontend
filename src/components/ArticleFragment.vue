<template>
  <v-expansion-panel-content v-show="!isEmptyXML(content)">
    <v-layout slot="header">
      <v-flex xs12>
        {{ title }}
      </v-flex>
      <v-flex>
        <v-menu open-on-hover v-if="infoUrl" max-width="400" max-height="95vh" top left>
          <v-icon class="mr-3" slot="activator">info_outline</v-icon>
          <info-text class="elevation-24 pa-4 white" :path="infoUrl" />
          <v-btn @click="showDetails = true" block color="ci" class="ma-0" dark v-if="extInfoUrl">Weitere Informationen</v-btn>
        </v-menu>
      </v-flex>
      <v-dialog v-model="showDetails" max-width="1000" color="#2b2735" scrollable v-if="extInfoUrl">
        <v-card flat class="fill-height pa-4">
          <div class="close-btn">
            <v-btn @click="showDetails = false" flat icon><v-icon dark>close</v-icon></v-btn>
          </div>
          <v-card-text class="pa-0 fill-height">
            <info-text class="pa-4 white fill-height" :path="extInfoUrl" />
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-layout>
    <v-card class="article-xml">
      <v-card-text class="pl-4 pt-1 pr-4 pb-4" v-html="content" />
    </v-card>
  </v-expansion-panel-content>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import InfoText from '@components/InfoText.vue'

@Component({
  components: {
    InfoText
  }
})
export default class ArticleFragment extends Vue {

  @Prop({ default: null }) content: string|null
  @Prop({ default: null }) infoUrl: string|null
  @Prop({ default: null }) extInfoUrl: string|null
  @Prop({ default: null }) title: string|null

  showDetails = false

  isEmptyXML(xml: string): boolean {
    const d = document.createElement('div')
    d.innerHTML = xml
    return d.innerText.trim() === ''
  }
}
</script>
<style lang="scss">
.close-btn {
  position: absolute;
  right: 0;
}
.article-xml {
  font-size: 100%;
  [collection-href] {
    cursor: pointer;
    border-bottom: 1px solid rgba(0,0,0,.2)
  }
  form {
    display: inline-block;
  }
  form[type="dialect"] {
    &[subtype="diminutive"] orth{
      font-style: italic
    }
    & + form[type="dialect"]::before {
      content: ', ';
    }
  }
  > form[type="lemma"] > orth {
    display: inline-block;
    font-size: 2.5em;
  }
  > form[type="lemma"] + form[type="lemma"]::before {
    content: ','
  }
  cit quote {
    &::before{
      content: "— "
    }
    font-style: italic;
  }
  gram {
    &[type="gender"]::before {
      display: inline;
      content: '(';
    }
    &[type="gender"] + [type="gender"]::before {
      content: none;
    }
    &[type="gender"] ~ [type="gender"]::after {
      content: ', '
    }
    &[type="gender"]:last-of-type::after{
      content: ')';
    }
  }
  > gramgrp{
    padding-left: 1em;
    &::after{
      display: block;
      content: ' ';
      margin-bottom: -1em;
    }
  }
  > form[type=variant] {
    display: block;
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
  cit, form[type=dialect] {
    usg[type=geo] {
      &::before {
        opacity: .6;
        margin-right: -.25em;
        display: inline;
        content: '('
      }
      & ~ usg::before {
        content: none;
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
      // margin-left: -.25em;
      margin-right: .25em;
    }
  }
  sense {
    margin-bottom: 1em;
    display: block;
    margin-left: 1em;
    padding-left: 1.5em;
    counter-increment: roman-counter;
    &:only-of-type{
      margin-left: 0em;
      padding-left: 0em;
    }
    &:empty{
      display: none;
    }
    &:not(:only-of-type)::before{
      width: 1.6em;
      position: absolute;
      margin-left: -2em;
      font-weight: 700;
      text-align: right;
      content: counter(roman-counter, upper-roman) ". "
    }
    sense {
      margin: 0;
      counter-increment: decimal-counter;
      &:not(:only-of-type)::before{
        font-weight: 700;
        content: counter(decimal-counter, decimal) ". "
      }
      sense {
        margin: 0;
        counter-increment: alpha-counter;
        &:not(:only-of-type)::before{
          font-weight: 700;
          content: counter(alpha-counter, lower-alpha) ") "
        }
        sense {
          margin: 0;
          counter-increment: greek-counter;
          &:not(:only-of-type)::before {
            font-weight: 700;
            content: counter(greek-counter, lower-greek) ". "
          }
        }
      }
    }
  }
}
</style>
