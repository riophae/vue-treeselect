<template>
  <treeselect :options="options" :multiple="true" />
</template>

<script>
  import { generateOptions } from '../utils'

  export default {
    data: () => ({
      options: generateOptions(1, 500),
    }),
  }
</script>
