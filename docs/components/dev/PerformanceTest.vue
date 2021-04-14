<template>
  <treeselect :options="options" :multiple="true" />
</template>

<script>
  import { defineComponent } from 'vue'
  import { generateOptions } from '../utils'

  export default defineComponent({
    data: () => ({
      options: generateOptions(1, 500),
    }),
  })
</script>
