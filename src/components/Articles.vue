<template>
  <div class="xml-article-display" v-html="xml"></div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
// tslint:disable:max-line-length
export default class Articles extends Vue {
  xml =  `<?xml version="1.0" encoding="UTF-8"?>
          <?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_all.rng" type="application/xml"
            schematypens="http://purl.oclc.org/dsdl/schematron"?>
          <?xml-model href="../803_RNG-schematron/WBOE-ODD.rnc" type="application/relax-ng-compact-syntax"?>
          <TEI
            xmlns="http://www.tei-c.org/ns/1.0">
            <teiHeader>
              YOYOYOYOYO
            </teiHeader>
          </TEI>`
}
</script>
<style lang="scss">
.xml-article-display {
  teiheader{
    color: red
  }
}
</style>
