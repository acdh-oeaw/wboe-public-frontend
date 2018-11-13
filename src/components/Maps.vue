<template>
  <div></div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class  extends Vue {
  @Prop() prop: string|null
  mounted() {
    
  }
}
</script>
<style lang="scss" scoped>
</style>
