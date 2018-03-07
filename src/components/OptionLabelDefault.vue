<template>
  <label class="vue-treeselect__label">
    {{ node.label }}
    <span v-if="shouldShowCount" class="vue-treeselect__count">({{ count }})</span>
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
    computed: {
      shouldShowCount() {
        return this.node.isBranch && (
          this.instance.searching
            ? this.instance.showCountOnSearchComputed
            : this.instance.showCount
          )
      },
      count() {
        return this.instance.searching
          ? this.instance.searchingCount[this.node.id][this.instance.showCountOf]
          : this.node.count[this.instance.showCountOf]
      },
    },
  }
</script>
