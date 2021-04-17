<template>
  <treeselect
    :options="options"
    :value="value"
    :searchable="false"
    :show-count="true"
    :default-expand-level="1"
    >
    <template #option-label="{ node, shouldShowCount, count, labelClassName, countClassName }">
      <label :class="labelClassName">
        {{ node.isBranch ? 'Branch' : 'Leaf' }}: {{ node.label }}
        <span v-if="shouldShowCount" :class="countClassName">({{ count }})</span>
      </label>
    </template>
  </treeselect>
</template>

<script>
  import { h, defineComponent } from 'vue'

  import { generateOptions } from './utils'

  export default defineComponent({
    data: () => ({
      value: null,
      options: generateOptions(2),
    }),
  },
  )
</script>
