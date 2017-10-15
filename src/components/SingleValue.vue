<template>
  <div class="vue-treeselect__value-wrapper">
    <div v-if="instance.hasValue && !instance.searchQuery" class="vue-treeselect__single-value">
      {{ instance.selectedNodes[0].label }}
    </div>
    <placeholder v-else-if="!instance.searchQuery" />
    <search-input key="input" ref="input" />
  </div>
</template>

<script>
  import valueMixin from '../mixins/valueMixin'
  import Placeholder from './Placeholder'
  import SearchInput from './SearchInput'

  export default {
    name: 'vue-treeselect--single-value',
    components: { Placeholder, SearchInput },
    mixins: [ valueMixin ],
    inject: [ 'instance' ],
  }
</script>
