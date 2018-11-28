<template>
  <div style="width: 100%; height: 100%;">
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
    <v-layout fill-height class="map-overlay pa-4">
      <v-flex xs3>
        <v-card height="300">
          <v-btn @click="zoom = zoom + 1" icon><v-icon>add</v-icon></v-btn>
          <v-btn @click="zoom = zoom - 1" icon><v-icon>remove</v-icon></v-btn>
        </v-card>
      </v-flex>
    </v-layout>
    <l-map
      class="mt-2"
      style="z-index: 0; position: absolute; left: 0; right: 0;"
      ref="map"
      :options="{ scrollWheelZoom: false, zoomControl: false }"
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

    zoom: number = 7
    center: number[] = [47.64318610543658, 13.53515625]
    geoStore = geoStore
    fillColor: string = '#2467a7'
    url: string = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
    attribution: string = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    randomColors: object = {}
    options = {
      onEachFeature: this.onEachFeatureFunction
    }

    layerGeoJson: any = null
    map: any = null

    get selectedLocations() {
      if (this.loc) {
        return this.loc.split(',')
      } else {
        return []
      }
    }

    selectLocations(locs: string[]) {
      if (locs.length === 0) {
        this.$router.replace({ query: {} })
      } else {
        this.$router.replace({ query: { loc: locs.join(',') } })
      }
    }

    get displayLocations() {
      if (this.loc && this.geojson) {
        const locations = this.loc.split(',')
        return {
          ...this.geojson,
          features: this.geojson.features.filter((f: any) => {
            return locations.indexOf(f.properties.sigle) > -1
          })
        }
      } else {
        return this.geojson
      }
    }

    get locationsSearchItems() {
      if (this.geojson !== null) {
        return this.geojson.features.map(f => {
          return {
            text: (f.properties as any).NAME_D || f.properties!.name,
            value: (f.properties as any).sigle
          }
        })
      } else {
        return []
      }
    }
    get geojson() {
      return this.geoStore.gemeinden
    }
    get styleFunction () {
      let aThis: any = this
      return (feature: any) => {
        let aSigleS: string = feature.properties.sigle.split('.')[0]
        if (!aThis.randomColors[aSigleS]) {
          aThis.randomColors[aSigleS] = '#'+Math.floor(Math.random()*16777215).toString(16)
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
    get onEachFeatureFunction () {
      let aThis: any = this
      return (feature: any, layer: any) => {
        layer.bindTooltip('<div>name:' + feature.properties.name + '</div><div>sigle:' + feature.properties.sigle + '</div><div>sigle:' + feature.properties.sigle.split('.')[0] + '</div>', { permanent: false, sticky: true })
        layer.on('mouseover', function (this: any) {
          this.setStyle({
            fillColor: '#0000ff',
            fillOpacity: 1
          });
        });
        layer.on('mouseout', function (this: any) {
          let aSigleS: string = feature.properties.sigle.split('.')[0]
          this.setStyle({
            fillColor: aThis.randomColors[aSigleS],
            fillOpacity: 0.5
          });
        });
      }
    }
    test () {
      if (this.geojson && this.layerGeoJson && this.map) {
        this.$nextTick(() => {
          this.map.mapObject.fitBounds(this.layerGeoJson.mapObject.getBounds())
        })
      }
    }
    get isLoading() {
      if (this.geojson === null) {
        return true
      } else {
        this.test()
        return false
      }
    }
    // created () {
    //   this.loading = true
    //   axios.get('/static/test_geo.json').then(response => {
    //     this.geojson = response.data
    //     this.loading = false
    //     this.test()
    //   });
    // }
    mounted () {
      console.log(L.latLng(47.413220, -1.219482))
      this.$nextTick(() => {
        this.layerGeoJson = this.$refs.layerGeoJson
        this.map = this.$refs.map
        this.test()
      })
    }
  }
</script>
<style lang="scss" scoped>
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
  @import "../../node_modules/leaflet/dist/leaflet.css";
</style>
