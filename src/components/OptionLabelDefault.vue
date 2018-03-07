<template>
  <label class="vue-treeselect__label">
    {{ node.label }}
    <span v-if="node.isBranch" class="vue-treeselect__count">
      <template v-if="!instance.searching && instance.showCount">({{ node.count[instance.showCountOf] }})</template>
      <template v-else-if="instance.searching && instance.showCountOnSearchComputed" class="vue-treeselect__count">({{ instance.searchingCount[node.id][instance.showCountOf] }})</template>
    </span>
  </label>
</template>

<script>
  export default {
    name: 'vue-treeselect--option-label',
    props: {
      node: {
        type: Object,
        required: true,
      },
      instance: {
        type: Object,
        required: true,
      },
    },
  }
</script>
