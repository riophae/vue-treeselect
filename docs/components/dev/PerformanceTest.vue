<template>
  <treeselect :options="options" :multiple="true" />
</template>

<script>
  import { h, defineComponent } from 'vue'
  import { generateOptions } from '../utils'

  export default defineComponent({
    data: () => ({
      options: generateOptions(1, 500),
    }),
  })
</script>
