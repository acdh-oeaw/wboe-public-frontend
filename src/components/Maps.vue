<template>
  <div>
      <v-card class="sticky-card" width="100%">
        <v-layout>
          <v-flex xs12>
            <v-autocomplete
              :loading="isLoading"
              :items="locationsSearchItems"
              :value="selectedLocations"
              @input="selectLocations"
              label="Suche…"
              autofocus
              hide-details
              dense
              flat
              prepend-inner-icon="search"
              solo
              clearable
              multiple>
              <template
                slot="item"
                slot-scope="data">
                <v-list-tile-action>
                  <v-checkbox v-model="data.tile.props.value"></v-checkbox>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title style="height: 19px;">{{ data.item.text }}</v-list-tile-title>
                  <v-list-tile-sub-title style="font-size: 85%;">{{ data.item.parents }}</v-list-tile-sub-title>
                </v-list-tile-content>
              </template>
            </v-autocomplete>
          </v-flex>
          <v-flex align-content-center fill-height>
            <v-select
              dense
              flat
              solo
              hide-details
              class="divider-left"
              v-model="searchItemType"
              :items="[{text: 'Ort', value: 'Ort', disabled: false}, {text: 'Lemma', value: 'Lemma', disabled: true}]" />
          </v-flex>
          <v-flex>
            <v-tooltip color="secondary" dark top>
              <v-btn slot="activator" @click="autoFit = !autoFit" :color="autoFit ? 'primary' : 'grey'" icon flat>
                <v-icon>my_location</v-icon>
              </v-btn>
              <span>Ausschnitt automatisch wählen</span>
            </v-tooltip>
          </v-flex>
          <v-flex>
            <v-menu open-on-hover max-width="400" max-height="95vh" top left>
              <v-btn slot="activator" color="accent" icon flat>
                <v-icon>info</v-icon>
              </v-btn>
              <info-text class="elevation-24 pa-4 white" path="karten/infokasten-zur-den-karten/" />
            </v-menu>
          </v-flex>
        </v-layout>
      </v-card>
    <v-layout fill-height class="map-overlay pa-4">
      <v-flex xs1>
        <v-btn fab small @click="zoom = zoom + 1"><v-icon>add</v-icon></v-btn>
        <v-tooltip color="ci" dark right>
          <v-btn slot="activator" fab small @click="resetView"><v-icon>home</v-icon></v-btn>
          <span>Ursprungsposition</span>
        </v-tooltip>
        <v-btn fab small @click="zoom = zoom - 1"><v-icon>remove</v-icon></v-btn>
      </v-flex>
      <v-flex class="text-xs-right" offset-xs10 xs1>
        <v-menu :close-on-click="false" :close-on-content-click="false" open-on-hover min-width="200" left lazy>
          <v-btn slot="activator" fab @click="true"><v-icon>layers</v-icon></v-btn>
          <v-card scrollable>
            <v-card-title>
              <small class="grey--text">Ansicht und Ebenen</small>
            </v-card-title>
            <v-divider />
            <v-card-text>
              <v-radio-group v-model="selectedTileSet">
                <v-radio v-for="(tileSet, i) in tileSets" :value="i" :key="i" :label="tileSet.name" />
              </v-radio-group>
              <v-checkbox v-model="showRivers" hide-details label="Flüsse" />
              <v-checkbox v-model="showHillshades" hide-details label="Gebirge" />
              <v-checkbox v-model="showDialektregionen" hide-details label="Dialektregionen" />
              <v-checkbox v-model="showBundeslaender" hide-details label="Bundesländer" />
            </v-card-text>
          </v-card>
        </v-menu>
      </v-flex>
      <v-menu open-on-hover min-width="200" fixed left lazy>
        <v-btn slot="activator" color="ci" dark fab fixed bottom right >
          <v-icon>save_alt</v-icon>
        </v-btn>
        <v-list class="context-menu-list" dense>
          <v-subheader>
            <v-icon class="mr-1" small>save_alt</v-icon> Export/Download
          </v-subheader>
          <v-list-tile @click="printMap('png')">
            PNG
          </v-list-tile>
          <v-list-tile disabled @click="printMap('svg')">
            SVG
          </v-list-tile>
          <v-list-tile @click="printMap('json')">
            GeoJSON
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-layout>
    <l-map
      style="z-index: 0; position: absolute; left: 0; right: 0; margin-top: -25px;"
      ref="map"
      :options="mapOptions"
      :zoom.sync="zoom"
      :center.sync="center">
      <l-tile-layer
        :url="tileSetUrl"
        :attribution="tileSets[selectedTileSet].attribution" />
      <l-tile-layer
        v-if="showHillshades"
        url="http://{s}.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png"
      />
      <l-geo-json
        v-if="selectedLocations.length > 0"
        ref="layerGeoJson"
        :geojson="displayLocations"
        :options="options"
        :optionsStyle="styleFunction"
        />
      <l-geo-json
        v-if="showDialektregionen"
        :options="{ onEachFeature: bindTooltip(['name']) }"
        :geojson="dialektregionen"
      />
      <l-geo-json
        v-if="showBundeslaender"
        :options="{ onEachFeature: bindTooltip(['name']) }"
        :geojson="bundeslaender"
        :optionsStyle="{ fillColor: '#800', color: '#800' }"
      />
      <l-geo-json
        v-if="showRivers && rivers !== null"
        :geojson="rivers"
      />
    </l-map>
  </div>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { LMap, LTileLayer, LMarker, LGeoJson, LIconDefault } from 'vue2-leaflet'
import InfoText from '@components/InfoText.vue'
import * as geojson from 'geojson'
import { geoStore } from '../store/geo'
import * as FileSaver from 'file-saver'
import domtoimage from 'dom-to-image'
import * as L from 'leaflet'
import * as _ from 'lodash'

function base64ToBlob(dataURI: string) {
  const byteString = atob(dataURI.split(',')[1])
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const dw = new DataView(ab)
  for (let i = 0; i < byteString.length; i++) {
    dw.setUint8(i, byteString.charCodeAt(i))
  }
  return new Blob([ab], {type: mimeString})
}

const defaultCenter = [47.64318610543658, 13.53515625]
const defaultZoom = 7

@Component({
  components: {
    InfoText,
    LMap,
    LTileLayer,
    LGeoJson,
    LMarker
  }
})
export default class Maps extends Vue {

  @Prop() loc: string|null
  @Prop() collection_ids: string|null

  tileSets = [
    {
      name: 'Humanitarian Open Tiles',
      url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png '
    },
    {
      name: 'Wikimedia',
      url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
    },
    {
      name: 'Hell ohne Labels',
      url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png',
      attribution: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL'
    },
    {
      name: 'Hell mit Lables',
      url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
      attribution: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL'
    },
    {
      name: 'Terrain',
      url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
      // tslint:disable-next-line:max-line-length
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
    },
    {
      name: 'Toner',
      url: 'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png'
    }
  ]
  selectedTileSet = 0

  showHillshades = false
  showRivers = false
  showDialektregionen = false
  showBundeslaender = false

  rivers: any = null
  autoFit = false
  zoom: number = defaultZoom
  center: number[] = defaultCenter
  geoStore = geoStore
  fillColor: string = '#2467a7'

  attribution: string = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  randomColors: object = {}
  mapOptions = {
    scrollWheelZoom: false, zoomControl: false,
    renderer: L.canvas()
  }
  options = {
    onEachFeature: this.onEachFeatureFunction,
    pointToLayer: (feature: any, latlng: any) => {
			return L.circleMarker(latlng, {
				radius: 5,
				fillColor: '#ff7800',
				color: '#000',
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
			})
		}
  }
  printPlugin: any = null
  searchItemType = 'Ort'
  layerGeoJson: any = null
  map: any = null

  get tileSetUrl(): string {
    return this.tileSets[this.selectedTileSet].url
  }

  get selectedLocations(): string[] {
    if (this.loc) {
      return this.loc.split(',')
    } else {
      return []
    }
  }

  async fitMap() {
    await this.$nextTick()
    if (this.map && this.layerGeoJson) {
      this.map.mapObject.fitBounds(this.layerGeoJson.mapObject.getBounds())
    }
  }

  resetView() {
    this.zoom = defaultZoom
    this.center = defaultCenter
  }

  async printMap(type?: string) {
    const el = (this.$refs.map as Vue).$el
    if (type === 'svg') {
      const blob = await domtoimage.toSvg(el)
      FileSaver.saveAs(new Blob([blob]), 'map.svg')
    } else if (type === 'png') {
      const uriString = await domtoimage.toPng(el)
      FileSaver.saveAs(base64ToBlob(uriString), 'map.png')
    } else if (type === 'json') {
      const blob = JSON.stringify(this.displayLocations, undefined, 2)
      FileSaver.saveAs(new Blob([blob]), 'map.json')
    }
  }

  selectLocations(locs: string[]) {
    if (locs.length === 0) {
      this.$router.replace({ query: {} })
      if (this.autoFit) {
        this.resetView()
      }
    } else {
      this.$router.replace({ query: { loc: locs.join(',') } })
      if (this.autoFit) {
        this.fitMap()
      }
    }
  }

  get allFeatures(): geojson.Feature[] {
    if (this.isLoading) {
      return []
    } else {
      return _([
        ...this.geoStore.bundeslaender!.features,
        ...this.geoStore.grossregionen!.features,
        ...this.geoStore.gemeinden!.features
      ]).map((f) => {
        return {
          ...f,
          properties: {
            ...f.properties,
            name:
              (f.properties as any).NAME_D ||
              (f.properties!.name) ||
              (f.properties as any).Bundesland ||
              (f.properties as any).Grossreg,
            sigle:
              (f.properties as any).sigle ||
              (f.properties as any).Sigle
          }
        }
      }).value()
    }
  }

  get bundeslaender(): geojson.Feature[] {
    if (!this.isLoading && this.geoStore.bundeslaender !== null) {
      return this.geoStore.bundeslaender.features
    } else {
      return []
    }
  }

  get dialektregionen(): geojson.Feature[] {
    if (!this.isLoading && this.geoStore.dialektregionen !== null) {
      return this.geoStore.dialektregionen.features
    } else {
      return []
    }
  }

  get displayLocations() {
    if (this.loc && !this.isLoading) {
      const locations = this.loc.split(',')
      return {
        ...this.geoStore!.gemeinden,
        features: this.allFeatures.filter((f: any) => {
          return locations.indexOf(f.properties.sigle) > -1
        })
      }
    } else {
      return this.allFeatures
    }
  }

  get locationsSearchItems() {
    if (!this.isLoading) {
      return this.geoStore.ortslisteGeo.map((f: any) => {
        return {
          text: f.name,
          value: f.sigle,
          parents: (f.parentsObj ? f.parentsObj.slice().reverse().map((o: any) => o.name).join(', ') : '')
        }
      })
    } else {
      return []
    }
  }
  get styleFunction() {
    let aThis: any = this
    return (feature: any) => {
      let aSigleS: string = feature.properties.sigle
      if (!aThis.randomColors[aSigleS]) {
        aThis.randomColors[aSigleS] = '#' + Math.floor(Math.random() * 16777215).toString(16)
      }
      return {
        weight: 1,
        color: '#333333',
        opacity: 1,
        // fillColor: aThis.randomColors[aSigleS],
        fillColor: '#800',
        fillOpacity: 0.5
      }
    }
  }

  bindTooltip(properties = ['name'], showLabel = false) {
    return (feature: geojson.Feature, layer: L.Layer) => {
      layer.bindTooltip(
        properties
          .map(p => `<div>${showLabel ? p + ': ' : ''}${ (feature.properties as any)[p] }</div>`)
          .join(''),
        { permanent: false, sticky: true }
      )
    }
  }

  get onEachFeatureFunction() {
    const aThis: any = this
    return (feature: geojson.Feature, layer: L.Layer) => {
      this.bindTooltip(['name', 'sigle'], true)(feature, layer)
      layer.on('mouseover', function(this: any) {
        this.setStyle({
          fillColor: '#0000ff',
          fillOpacity: 1
        })
      })
      layer.on('mouseout', function(this: any) {
        const aSigleS = (feature.properties as any).sigle
        this.setStyle({
          // fillColor: aThis.randomColors[aSigleS],
          fillColor: '#800',
          fillOpacity: 0.5
        })
      })
    }
  }
  get isLoading() {
    if (
      this.geoStore.gemeinden !== null &&
      this.geoStore.grossregionen !== null &&
      this.geoStore.bundeslaender !== null &&
      this.geoStore.ortsliste !== null
    ) {
      return false
    } else {
      return true
    }
  }
  async loadRivers() {
    // tslint:disable-next-line:max-line-length
    this.rivers = await (await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_europe.geojson')).json()
  }
  mounted() {
    this.loadRivers()
    this.$nextTick(() => {
      this.layerGeoJson = this.$refs.layerGeoJson
      this.map = this.$refs.map
    })
  }
}
</script>
<style lang="scss" scoped>
@import "../../node_modules/leaflet/dist/leaflet.css";
.map-overlay{
  position: absolute;
  z-index: 1;
  width: 100%;
  left: 0;
  right: 0;
  pointer-events: none;
  * {
    pointer-events: all
  }
}
.sticky-card {
  z-index: 1;
  position: -webkit-sticky;
  position: sticky;
  top: 5px;
}
</style>
