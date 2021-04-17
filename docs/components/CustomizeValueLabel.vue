<template>
  <div>
    <treeselect :options="options" :value="value" :multiple="multiple">
      <template #value-label="{ node }">
        <div>{{ node.raw.customLabel }}</div>
      </template>
    </treeselect>
    <p>
      <label><input type="checkbox" v-model="multiple">Multi-select</label>
    </p>
  </div>
</template>

<script>
  import { h, defineComponent } from 'vue'

  export default defineComponent({
    data: () => ({
      multiple: true,
      value: null,
      options: [ 1, 2, 3 ].map(i => ({
        id: i,
        label: `Label ${i}`,
        customLabel: `Custom Label ${i}`,
      })),
    }),
  },
  )
</script>
