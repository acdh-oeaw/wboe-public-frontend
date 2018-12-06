<template>
  <v-layout column>
    <v-flex>
      <v-text-field
        autofocus
        flat
        label="Suche…"
        prepend-inner-icon="search"
        solo
        clearable
      />
    </v-flex>
    <v-flex>
      <v-data-table
        :headers="headers"
        :loading="loading"
        :items="items"
        class="elevation-1">
        <template slot="items" slot-scope="props">
          <td v-for="(header, i) in headers" :key="i">
            {{ props.item[header.value] }}
          </td>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getDocuments } from '../api'

@Component
export default class Database extends Vue {
  items: any[] = []
  loading = false
  headers = [
    { text: 'Hauptlemma', value: 'Hauptlemma' },
    { text: 'Wortart', value: 'Wortart' },
    { text: 'Lautung', value: 'Nebenlemma' },
    { text: 'Bedeutung', value: 'Bedeutung' },
    { text: 'Kontext', value: 'Kontext' },
    { text: 'FB-Nr.', value: 'Fragebogennummer' },
  ]
  async mounted() {
    this.loading = true
    this.items = (await getDocuments()).map(x => x._source)
    this.loading = false
  }
}
</script>
<style lang="scss" scoped>
</style>
