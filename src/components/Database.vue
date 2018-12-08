<template>
  <v-layout column>
    <v-flex>
      <v-text-field
        autofocus
        flat
        label="Datenbank durchsuchen…"
        prepend-inner-icon="search"
        solo
        clearable
      />
    </v-flex>
    <v-flex>
      <v-data-table
        select-all
        class="data-table"
        :rows-per-page-items="[10, 25, 50, 100]"
        :pagination.sync="pagination"
        :headers="headers"
        :loading="loading"
        :items="items">
        <template slot="items" slot-scope="props">
          <td>
            <v-checkbox :input-value="props.selected" primary hide-details />
          </td>
          <td v-line-clamp="{ lines: 2, text: props.item[header.value] }" v-for="(header, i) in headers" :key="i">
            <!-- {{ props.item[header.value] }} -->
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
  pagination = {
    descending: true,
    page: 1,
    rowsPerPage: 50,
    sortBy: null,
    // totalItems: number
  }
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
