<template>
  <div class="pt-4">
    <info-text link-list subDialog="true" :path="link" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import InfoText from '@components/InfoText.vue'

@Component({
  components: {
    InfoText
  }
})
export default class Resources extends Vue {
  @Prop({ default: 'materialien/einleitungstext/' }) link: string|null
}
</script>
<style lang="scss" scoped>
</style>
