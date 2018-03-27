<template>
  <div class="vue-treeselect__value-wrapper">
    <transition-group
      tag="div"
      class="vue-treeselect__multi-value"
      name="vue-treeselect__multi-value-item--zoom"
      appear>
      <template v-for="node in instance.visibleValue">
        <div class="vue-treeselect__multi-value-item-wrapper" @mousedown="handleMouseDownOnValue" :key="'value-' + node.id">
          <div :class="[ 'vue-treeselect__multi-value-item', { 'vue-treeselect__multi-value-item-disabled': node.isDisabled } ]">
            <span class="vue-treeselect__multi-value-label">{{ node.label }}</span><span class="vue-treeselect__icon vue-treeselect__value-remove" @mousedown="instance.select(node)">&times;</span>
          </div>
        </div>
      </template>
      <div v-if="instance.hasExceededLimit" class="vue-treeselect__limit-tip vue-treeselect-helper-zoom-effect-off" key="limit-tip">
        <span class="vue-treeselect__limit-tip-text">{{ limitText }}</span>
      </div>
      <placeholder v-if="!instance.hasValue && !instance.searchQuery" key="placeholer" />
      <search-input key="input" ref="input" />
    </transition-group>
  </div>
</template>

<script>
  import valueMixin from '../mixins/valueMixin'
  import Placeholder from './Placeholder'
  import SearchInput from './SearchInput'

  export default {
    name: 'vue-treeselect--multi-value',
    components: { Placeholder, SearchInput },
    mixins: [ valueMixin ],
    inject: [ 'instance' ],
  }
</script>
