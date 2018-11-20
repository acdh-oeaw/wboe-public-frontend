<template>
  <div style="width: 100%; height: 100%;">
    <span v-if="loading" class="loading">Lade ...</span>
    <l-map
      :zoom.sync="zoom"
      :center.sync="center">
      <l-geo-json
        v-if="show"
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
    @Prop() prop: string|null

    loading: boolean = false
    show: boolean = true
    zoom: number = 7
    center: Array<number> = [47.64318610543658, 13.53515625]
    geojson: any = null
    fillColor: string = '#2467a7'
    get options () {
      return {
        onEachFeature: this.onEachFeatureFunction
      }
    }
    get styleFunction () {
      const fillColor = this.fillColor
      return () => {
        return {
          weight: 1,
          color: '#FFFFFF',
          opacity: 1,
          fillColor: fillColor,
          fillOpacity: 1
        }
      }
    }
    get onEachFeatureFunction () {
      return (feature: any, layer: any) => {
        layer.bindTooltip('<div>name:' + feature.properties.name + '</div><div>sigle:' + feature.properties.sigle + '</div>', { permanent: false, sticky: true })
      }
    }
    created() {
      this.loading = true
      axios.get('/static/test_geo.json').then(response => {
        this.geojson = response.data;
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
