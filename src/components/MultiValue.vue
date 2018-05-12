<template>
  <div class="vue-treeselect__value-container">
    <transition-group tag="div" class="vue-treeselect__multi-value" name="vue-treeselect__multi-value-item--transition" appear>
      <template v-for="node in instance.visibleValue">
        <div class="vue-treeselect__multi-value-item-container" :key="'value-' + node.id">
          <div :class="[ 'vue-treeselect__multi-value-item', { 'vue-treeselect__multi-value-item-disabled': node.isDisabled } ]" @mousedown="handleMouseDownOnValueItem($event, node)">
            <span class="vue-treeselect__multi-value-label">{{ node.label }}</span>
            <span class="vue-treeselect__icon vue-treeselect__value-remove"><delete-icon /></span>
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
  import DeleteIcon from './icons/Delete'

  export default {
    name: 'vue-treeselect--multi-value',
    components: { Placeholder, SearchInput, DeleteIcon },
    mixins: [ valueMixin ],
    inject: [ 'instance' ],
  }
</script>
