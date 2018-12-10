<template>
  <v-layout column>
    <v-flex>
      <v-card class="elevation-0">
        <v-layout class="mb-2">
          <v-flex xs12>
            <v-text-field
              v-if="searchItemType === 'fulltext'"
              autofocus
              flat
              label="Datenbank durchsuchen…"
              prepend-inner-icon="search"
              v-model="searchTerm"
              @input="debouncedSearchDatabase"
              :loading="searching"
              hide-details
              solo
              clearable
            />
            <v-autocomplete
              v-if="searchItemType === 'collection'"
              autofocus
              flat
              label="Sammlungen suchen…"
              :search-input.sync="searchCollection"
              prepend-inner-icon="search"
              :loading="searching"
              :items="collectionSearchItems"
              :value="selectedCollections"
              @input="selectCollections"
              chips
              deletable-chips
              cache-items
              return-object
              hide-details
              dense
              multiple
              solo
              clearable>
              <template
                slot="item"
                slot-scope="data">
                <v-list-tile-action>
                  <v-checkbox v-model="data.tile.props.value"></v-checkbox>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title style="height: 19px;">{{ data.item.text }}</v-list-tile-title>
                  <v-list-tile-sub-title style="font-size: 85%;">{{ data.item.description }}</v-list-tile-sub-title>
                </v-list-tile-content>
              </template>
            </v-autocomplete>
          </v-flex>
          <v-flex align-content-center fill-height>
            <div>
              <v-select
                dense
                flat
                solo
                hide-details
                v-model="searchItemType"
                :items="[{text: 'Volltext', value: 'fulltext'}, { text: 'Sammlung', value: 'collection' }]" />
            </div>
          </v-flex>
        </v-layout>
      </v-card>
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
          <v-tooltip color="ci" top :disabled="mappableSelectionItems.length > 0">
            <v-menu :nudge-top="4" top offset-y slot="activator" open-on-hover :disabled="mappableSelectionItems.length === 0" >
              <v-btn
                @click="showSelectionOnMap"
                slot="activator"
                :disabled="mappableSelectionItems.length === 0"
                small
                class="pl-3 pr-3"
                round
                depressed
                color="primary">
                auf Karte zeigen ({{ mappableSelectionItems.length }})
              </v-btn>
              <v-list dense>
                <v-list-tile @click="selected = []">Auswahl leeren</v-list-tile>
              </v-list>
            </v-menu>
            <span>Wählen Sie zuvor Dokumente mit Ortsangaben aus</span>
          </v-tooltip>
          <v-menu top open-on-hover>
            <v-btn slot="activator" :disabled="items.length === 0" small flat class="pl-3 pr-3" round color="ci">
              Export {{ selected.length > 0 ? `(${this.selected.length})` : ''}}
            </v-btn>
            <v-list class="context-menu-list" dense>
              <v-subheader>
                <v-icon class="mr-1" small>save_alt</v-icon> Export/Download
              </v-subheader>
              <v-list-tile @click="saveXLSX">Microsoft Excel</v-list-tile>
              <v-list-tile @click="saveJSON">JSON</v-list-tile>
              <v-list-tile @click="saveCSV">CSV</v-list-tile>
              <v-divider />
              <v-list-tile :disabled="selected.length === 0" @click="selected = []">Auswahl leeren</v-list-tile>
            </v-list>
          </v-menu>
        </v-flex>
        <template slot="items" slot-scope="props">
          <td>
            <v-checkbox v-model="props.selected" hide-details />
          </td>
          <td @click="props.selected = !props.selected" class="line-clamp" v-for="(header, i) in headers" :key="i">
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
import {
  getDocuments,
  searchDocuments,
  getDocumentTotalCount,
  getDocumentsByCollection,
  searchCollections,
  getCollectionByIds } from '../api'
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

  @Prop() collection_ids: string|null
  @Prop() query: string|null

  geoStore = geoStore
  items: any[] = []
  searchTerm: string|null = null
  searchItemType = 'fulltext'
  searchCollection: string|null = null
  collectionSearchItems: any[] = []
  selectedCollections: any[] = []
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
    if (this.collection_ids) {
      this.loadCollectionIds(this.collectionIdList)
    } else {
      this.init()
    }
  }

  @Watch('searchCollection')
  async onSearchCollection(val: string|null) {
    if (val !== null && val.trim() !== '') {
      this.collectionSearchItems = (await searchCollections(val)).map(x => ({ ...x, text: x.name }))
    }
  }

  selectCollections(colls: any[]) {
    this.$router.replace({ query: { collection_ids: colls.map((x) => x.value).join() } })
  }

  get collectionIdList() {
    if (this.collection_ids) {
      return this.collection_ids.split(',')
    } else {
      return []
    }
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

  @Watch('collectionIdList')
  async loadCollectionIds(ids: string[]) {
    if (ids.length > 0) {
      this.searchItemType = 'collection'
      this.searching = true
      const ress = await Promise.all(ids.map((x) => getDocumentsByCollection(x)))
      this.items = _(ress)
        .flatMap(res => res.documents)
        .uniqBy(d => d.id)
        .map(d => ({ ...d, ...this.getPlacesFromSigle(d.ortsSigle)}))
        .value()
      this.pagination.totalItems = ress.reduce((m, v) => m + v.total , 0)
      const cs = await getCollectionByIds(ids)
      this.selectedCollections = cs.map(x => ({...x, text: x.name}))
      this.collectionSearchItems = cs.map(x => ({...x, text: x.name}))
      this.searching = false
    } else {
      this.selectedCollections = []
    }
  }

  @Watch('pagination', {deep: true})
  updateResults(newVal: any, oldVal: any) {
    if (newVal.page !== oldVal.page) {
      window.scroll({ top: 0, behavior: 'smooth' })
    }
    if (this.query) {
      this.onChangeQuery(this.query)
    } else if (this.collection_ids) {
      this.loadCollectionIds(this.collectionIdList)
    } else {
      this.init()
    }
  }

  get mappableSelectionItems() {
    return _(this.selected)
      .filter(i => i.Bundesland !== '' || i.Großregion !== '' || i.Ort !== '')
      .uniqBy(i => i.ortsSigle)
      .value()
  }

  showSelectionOnMap() {
    if (this.selected.length > 0) {
      this.$router.push({
        path: '/maps',
        query: {
          loc: this.mappableSelectionItems.map(d => d.ortsSigle).join(',')
        }
      })
    }
  }

  @Watch('query')
  async onChangeQuery(search: string|null) {
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

  async searchDatabase(search: string) {
    this.$router.replace({ query: { query: search } })
  }

  saveXLSX() {
    const x = xlsx.utils.json_to_sheet(this.selected || this.items)
    const y = xlsx.writeFile({
      Sheets: { sheet: x },
      SheetNames: [ 'sheet' ],
    }, 'wboe-lioe-export.xlsx')
  }

  saveCSV() {
    const x = xlsx.utils.json_to_sheet(this.selected || this.items)
    const y = xlsx.writeFile({
      Sheets: { sheet: x },
      SheetNames: [ 'sheet' ]
    }, 'wboe-lioe-export.csv')
  }

  saveJSON() {
    const blob = JSON.stringify(this.selected || this.items, undefined, 2)
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
