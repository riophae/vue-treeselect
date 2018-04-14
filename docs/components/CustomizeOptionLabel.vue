<template>
  <treeselect
    :options="options"
    :value="value"
    :searchable="false"
    :show-count="true"
    :default-expand-level="1"
    >
    <label slot="option-label" slot-scope="{ node, shouldShowCount, count, labelClassName, countClassName }" :class="labelClassName">
      {{ node.isBranch ? 'Branch' : 'Leaf' }}: {{ node.label }}
      <span v-if="shouldShowCount" :class="countClassName">({{ count }})</span>
    </label>
  </treeselect>
</template>

<script>
  import { generateOptions } from './utils'

  export default {
    data: () => ({
      value: null,
      options: generateOptions(2),
    }),
  }
</script>
