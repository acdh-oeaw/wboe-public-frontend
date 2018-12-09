<template>
  <v-layout column>
    <v-flex>
      <v-text-field
        autofocus
        flat
        label="Datenbank durchsuchen…"
        prepend-inner-icon="search"
        v-model="searchTerm"
        @input="debouncedSearchDatabase"
        :loading="searching"
        solo
        clearable
      />
    </v-flex>
    <v-flex>
      <v-data-table
        v-model="selected"
        select-all
        class="data-table"
        :total-items="pagination.totalItems"
        rows-per-page-text="Pro Seite"
        :rows-per-page-items="[10, 25, 50, 100]"
        :pagination.sync="pagination"
        :headers="headers"
        :loading="loading"
        item-key="id"
        :items="items">
        <v-flex slot="actions-prepend">
          <v-tooltip color="ci" top :disabled="selected.length > 0">
            <v-btn
              slot="activator"
              :disabled="selected.length === 0"
              small
              flat
              class="pl-3 pr-3"
              round
              color="ci">
              auf Karte zeigen ({{ selected.length }})
            </v-btn>
            <span>Wählen Sie zuvor Dokumente aus</span>
          </v-tooltip>
          <v-menu top open-on-hover>
            <v-btn slot="activator" :disabled="items.length === 0" small flat class="pl-3 pr-3" round color="ci">
              Export
            </v-btn>
            <v-list class="context-menu-list" dense>
              <v-subheader>
                <v-icon class="mr-1" small>save_alt</v-icon> Export/Download
              </v-subheader>
              <v-list-tile @click="saveXLSX">Microsoft Excel</v-list-tile>
              <v-list-tile @click="saveJSON">JSON</v-list-tile>
              <v-list-tile @click="saveCSV">CSV</v-list-tile>
            </v-list>
          </v-menu>
        </v-flex>
        <template slot="items" slot-scope="props">
          <td>
            <v-checkbox v-model="props.selected" hide-details />
          </td>
          <td class="line-clamp" v-for="(header, i) in headers" :key="i">
            {{ props.item[header.value] }}
          </td>
        </template>
        <template slot="pageText" slot-scope="props">
          {{ props.pageStart }} - {{ props.pageStop }} von {{ props.itemsLength }}
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getDocuments, searchDocuments, getDocumentTotalCount } from '../api'
import { geoStore } from '../store/geo'
import * as FileSaver from 'file-saver'
import * as xlsx from 'xlsx'
import * as _ from 'lodash'

interface Places {
  Ort: string
  Bundesland: string
  Großregion: string
}

@Component
export default class Database extends Vue {
  geoStore = geoStore
  items: any[] = []
  searchTerm: string|null = null
  selected: any[] = []
  loading = false
  searching = false
  pagination = {
    descending: true,
    page: 1,
    rowsPerPage: 100,
    sortBy: null,
    totalItems: 0
  }
  headers = [
    { text: 'Hauptlemma', value: 'Hauptlemma' },
    { text: 'Wortart', value: 'Wortart' },
    { text: 'Lautung', value: 'Nebenlemma' },
    { text: 'Bedeutung', value: 'Bedeutung' },
    { text: 'Kontext', value: 'Kontext' },
    { text: 'FB-Nr.', value: 'Fragebogennummer' },
    { text: 'Ort', value: 'Ort', sortable: false },
    { text: 'Großreg.', value: 'Großregion', sortable: false },
    { text: 'Bundesl.', value: 'Bundesland', sortable: false }
  ]

  debouncedSearchDatabase = _.debounce(this.searchDatabase, 250)

  async mounted() {
    this.init()
  }

  getPlacesFromSigle(sigle: string): Places {
    const place = _(geoStore.ortsliste).find(o => o.sigle === sigle)
    if (place === undefined) {
      return {
        Ort: '',
        Großregion: '',
        Bundesland: ''
      }
    } else {
      const bl = _(place.parentsObj).find(o => o.field === 'Bundesland')
      const gr = _(place.parentsObj).find(o => o.field === 'Großregion')
      return {
        Ort: place.name,
        Großregion: gr ? gr.name : '',
        Bundesland: bl ? bl.name : '',
        [ place.field ]: place.name,
      }
    }
  }

  async init() {
    this.loading = true
    this.pagination.totalItems = await getDocumentTotalCount()
    const res = await getDocuments(
      this.pagination.page,
      this.pagination.rowsPerPage,
      // this.pagination.descending,
      // this.pagination.sortBy
    )
    this.items = res.documents.map(d => ({
      ...d,
      ...this.getPlacesFromSigle(d.ortsSigle)
    }))
    this.loading = false
  }

  @Watch('pagination', {deep: true})
  updateResults() {
    if (this.searchTerm !== null) {
      this.searchDatabase(this.searchTerm)
    } else {
      this.init()
    }
  }

  async searchDatabase(search: string) {
    if (search) {
      this.searching = true
      const res = await searchDocuments(
        search,
        this.pagination.page,
        this.pagination.rowsPerPage,
        this.pagination.descending,
        this.pagination.sortBy
      )
      this.items = res.documents.map(d => ({
        ...d,
        ...this.getPlacesFromSigle(d.ortsSigle)
      }))
      this.pagination.totalItems = res.total
      this.searching = false
    } else {
      this.init()
    }
  }

  saveXLSX() {
    const x = xlsx.utils.json_to_sheet(this.items)
    const y = xlsx.writeFile({
      Sheets: { sheet: x },
      SheetNames: [ 'sheet' ],
    }, 'wboe-lioe-export.xlsx')
  }

  saveCSV() {
    const x = xlsx.utils.json_to_sheet(this.items)
    const y = xlsx.writeFile({
      Sheets: { sheet: x },
      SheetNames: [ 'sheet' ]
    }, 'wboe-lioe-export.csv')
  }

  saveJSON() {
    const blob = JSON.stringify(this.items, undefined, 2)
    FileSaver.saveAs(new Blob([blob]), 'wboe-lioe-export.json')
  }

}
</script>
<style lang="scss">
div.v-datatable.v-table.v-datatable--select-all.theme--light{
  position: -webkit-sticky;
  position: sticky;
  bottom: 0;
}
</style>
