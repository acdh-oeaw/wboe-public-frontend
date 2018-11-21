<template>
  <div style="width: 100%; height: 100%;">
    <span v-if="loading" class="loading">Lade ...</span>
    <l-map
      :zoom.sync="zoom"
      :center.sync="center">
      <l-tile-layer
        :url="url"
        :attribution="attribution"/>
      <l-geo-json
        v-if="show"
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

    loading: boolean = false
    show: boolean = true
    zoom: number = 7
    center: Array<number> = [47.64318610543658, 13.53515625]
    geojson: any = null
    fillColor: string = '#2467a7'
    url: string = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
    attribution: string = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    randomColors: object = {}

    get displayLocations() {
      if (this.loc !== null && this.geojson !== null) {
        const locations = this.loc.split(',')
        console.log(locations)
        const x = {
          ...this.geojson,
          features: this.geojson.features.filter((f: any) => {
            return locations.indexOf(f.properties.sigle) > -1
          })
        }
        return x
      } else {
        return this.geojson
      }
    }
    get options () {
      return {
        onEachFeature: this.onEachFeatureFunction
      }
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
    created() {
      this.loading = true
      axios.get('/static/test_geo.json').then(response => {
        this.geojson = response.data
        this.loading = false
      });
    }
    mounted() {
      console.log(L.latLng(47.413220, -1.219482))
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../node_modules/leaflet/dist/leaflet.css";
  .loading {
    position: absolute;
    top: 0px;
    left: 45%;
  }
</style>
