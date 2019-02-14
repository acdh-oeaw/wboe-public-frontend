<template>
  <div>
    <v-flex xs12 sm12 md10 lg8 xl6 offset-md1 offset-lg2 offset-xl3 :style="fstyle" v-if="show">
      <v-card>
        <v-card-text primary-title>
          <div class="text-xs-center w-100">
            <div class="close-btn">
              <v-btn @click="show = false" small flat icon><v-icon dark>close</v-icon></v-btn>
            </div>
            <slot/>
          </div>
        </v-card-text>
      </v-card>
    </v-flex>
  </div>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getWebsiteHtml, isExternUrl, isLocalUrl } from '../api'

@Component

export default class InfoBox extends Vue {
  @Prop({ default: null }) fstyle: string|null
  show: boolean = true
}
</script>
<style lang="scss" scoped>
.close-btn {
  position: absolute;
  right: 0;
  top: 3px;
}
</style>
