<template>
  <div style="width: 100%; height: 100%;">
    <span v-if="loading" class="loading">Lade ...</span>
    <l-map
      ref="map"
      :zoom.sync="zoom"
      :center.sync="center">
      <l-tile-layer
        :url="url"
        :attribution="attribution"/>
      <l-geo-json
        v-if="show"
        ref="layerGeoJson"
        :geojson="geojson"
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
    @Prop () prop: string|null

    loading: boolean = false
    show: boolean = false
    zoom: number = 7
    center: Array<number> = [47.64318610543658, 13.53515625]
    geojson: any = null
    fillColor: string = '#2467a7'
    url: string = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
    attribution: string = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    randomColors: object = {}
    layerGeoJson: any = null
    map: any = null

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
    test () {
      if (this.geojson && this.layerGeoJson && this.map) {
        this.$nextTick(() => {
          this.map.mapObject.fitBounds(this.layerGeoJson.mapObject.getBounds())
        })
      }
    }
    created () {
      this.loading = true
      axios.get('/static/test_geo.json').then(response => {
        this.geojson = response.data
        this.loading = false
        this.test()
      });
    }
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
  @import "../../node_modules/leaflet/dist/leaflet.css";
  .loading {
    position: absolute;
    top: 0px;
    left: 45%;
  }
</style>
