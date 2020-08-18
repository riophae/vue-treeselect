<template>
  <treeselect :options="options" :multiple="true">
    <template
      #option-label="{ node, shouldShowCount, count, labelClassName, on }"
      >
      <span :class="labelClassName" v-on="on" v-text="node.label" />
    </template>
  </treeselect>
</template>

<script>
  import { generateOptions } from '../utils'

  export default {
    data: () => ({
      options: generateOptions(1, 500),
    }),
    methods: {
    },

  }
</script>
