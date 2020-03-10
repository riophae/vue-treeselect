<template>
  <div>
    <treeselect :options="options" :value="value" :multiple="multiple">
      <div slot="value-label" slot-scope="{ node }">{{ node.raw.customLabel }}</div>
    </treeselect>
    <p>
      <label><input type="checkbox" v-model="multiple">Multi-select</label>
    </p>
  </div>
</template>

<script>
  export default {
    data: () => ({
      multiple: true,
      value: null,
      options: [ 1, 2, 3 ].map(i => ({
        id: i,
        label: `Label ${i}`,
        customLabel: `Custom Label ${i}`,
      })),
    }),
  }
</script>
