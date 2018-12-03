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
              multiple />
          </v-flex>
          <v-flex align-content-center fill-height>
            <v-select
              dense
              flat
              solo
              hide-details
              v-model="searchItemType"
              :items="['Ort', 'Lemma']" />
          </v-flex>
          <v-flex>
            <v-tooltip color="ci" dark top>
              <v-btn slot="activator" @click="autoFit = !autoFit" :color="autoFit ? 'primary' : 'grey'" icon flat>
                <v-icon>my_location</v-icon>
              </v-btn>
              <span>Ausschnitt automatisch wählen</span>
            </v-tooltip>
          </v-flex>
        </v-layout>
      </v-card>
    <v-layout fill-height class="map-overlay pa-4">
      <v-flex xs1>
        <v-btn fab small @click="zoom = zoom + 1"><v-icon>add</v-icon></v-btn>
        <v-btn fab small @click="resetView"><v-icon>home</v-icon></v-btn>
        <v-btn fab small @click="zoom = zoom - 1"><v-icon>remove</v-icon></v-btn>
      </v-flex>
      <v-flex class="text-xs-right" offset-xs10 xs1>
        <v-tooltip color="ci" dark left>
          <v-btn slot="activator" fab @click="zoom = zoom + 1"><v-icon>layers</v-icon></v-btn>
          <span>Ansicht und Ebenen</span>
        </v-tooltip>
      </v-flex>
      <v-menu min-width="200" :nudge-bottom="5" :nudge-left="5" left lazy offset-x offset-y>
        <v-btn slot="activator" color="ci" dark fab fixed bottom right >
          <v-icon>save_alt</v-icon>
        </v-btn>
        <v-list class="context-menu-list" dense>
          <v-list-tile>
            test
          </v-list-tile>
          <v-list-tile>
            test
          </v-list-tile>
          <v-list-tile>
            test
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
        :url="url"
        :attribution="attribution"/>
      <l-geo-json
        v-if="selectedLocations.length > 0"
        ref="layerGeoJson"
        :geojson="displayLocations"
        :options="options"
        :optionsStyle="styleFunction"
        />
    </l-map>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { LMap, LTileLayer, LMarker, LGeoJson } from 'vue2-leaflet'
import { geoStore } from '../store/geo'
import * as L from 'leaflet'
import * as _ from 'lodash'

const defaultCenter = [47.64318610543658, 13.53515625]
const defaultZoom = 7

import axios from 'axios';

@Component({
  components: {
    LMap,
    LTileLayer,
    LGeoJson,
    LMarker
  }
})
export default class Maps extends Vue {

  @Prop() loc: string|null
  @Prop() collection_ids: string|null

  autoFit = false
  zoom: number = defaultZoom
  center: number[] = defaultCenter
  geoStore = geoStore
  fillColor: string = '#2467a7'
  url: string = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
  attribution: string = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  randomColors: object = {}
  mapOptions = {
    scrollWheelZoom: false, zoomControl: false,
    renderer: L.canvas()
  }
  options = {
    onEachFeature: this.onEachFeatureFunction
  }
  searchItemType = 'Ort'
  layerGeoJson: any = null
  map: any = null

  get selectedLocations() {
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

  get allFeatures() {
    if (!this.isLoading) {
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
      return this.allFeatures.map(f => {
        return {
          text: f.properties.name,
          value: (f.properties as any).sigle
        }
      })
    } else {
      return []
    }
  }
  get styleFunction() {
    let aThis: any = this
    return (feature: any) => {
      let aSigleS: string = feature.properties.sigle.split('.')[0]
      if (!aThis.randomColors[aSigleS]) {
        aThis.randomColors[aSigleS] = '#' + Math.floor(Math.random() * 16777215).toString(16)
      }
      return {
        weight: 1,
        color: '#333333',
        opacity: 1,
        fillColor: aThis.randomColors[aSigleS],
        fillOpacity: 0.5
      }
    }
  }
  get onEachFeatureFunction() {
    const aThis: any = this
    return (feature: any, layer: any) => {
      layer.bindTooltip(`
        <div>name: ${feature.properties.name}</div>
        <div>sigle: ${feature.properties.sigle}</div>
        <div>sigle: ${feature.properties.sigle.split('.')[0]}</div>`,
        { permanent: false, sticky: true }
      )
      layer.on('mouseover', function(this: any) {
        this.setStyle({
          fillColor: '#0000ff',
          fillOpacity: 1
        });
      });
      layer.on('mouseout', function(this: any) {
        const aSigleS = feature.properties.sigle.split('.')[0]
        this.setStyle({
          fillColor: aThis.randomColors[aSigleS],
          fillOpacity: 0.5
        });
      });
    }
  }
  get isLoading() {
    if (
      this.geoStore.gemeinden !== null &&
      this.geoStore.grossregionen !== null &&
      this.geoStore.bundeslaender !== null
    ) {
      return false
    } else {
      return true
    }
  }
  mounted() {
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
