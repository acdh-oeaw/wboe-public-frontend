<template>
  <codemirror :value="value" @input="$emit('input', $event)" :options="editorOptions" />
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { codemirror, CodeMirror } from 'vue-codemirror-lite'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/mode/xml/xml.js'
import 'codemirror/addon/search/search.js'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/search/jump-to-line.js'
import 'codemirror/addon/dialog/dialog.js'
import 'codemirror/addon/edit/closetag.js'
import 'codemirror/addon/fold/xml-fold.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/hint/xml-hint.js'
import 'codemirror/addon/hint/show-hint.js'

@Component({
  components: {
    codemirror
  }
})
export default class  extends Vue {
  @Prop() value: string
  editorOptions = {
    mode: 'application/xml',
    styleActiveLine: true,
    lineNumbers: true,
    lineWrapping: true,
    tabSize: 2,
    line: true,
    extraKeys: {'Ctrl-Space': 'autocomplete'},
    theme: 'duotone-dark',
    height : 'auto',
    width : '100%',
    viewportMargin : Infinity,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    hintOptions : {},
    autoCloseTags: true,
    foldGutter: true,
    autoCloseBrackets: true,
    matchBrackets: true
  }
  @Watch('show')
  update() {
    CodeMirror.refresh()
  }
  async mounted() {
    await this.$nextTick()
    // CodeMirror.refresh()
  }
}
</script>
<style>
  @import '../../node_modules/codemirror/lib/codemirror.css';
  @import '../../node_modules/codemirror/theme/duotone-dark.css';
  @import '../../node_modules/codemirror/addon/hint/show-hint.css';
  @import '../../node_modules/codemirror/addon/dialog/dialog.css';
  .CodeMirror { height: auto; }
</style>
