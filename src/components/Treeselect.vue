<template>
  <div
    :class="[ 'vue-treeselect', {
      'vue-treeselect--single': !multiple,
      'vue-treeselect--multi': multiple,
      'vue-treeselect--searchable': searchable,
      'vue-treeselect--disabled': disabled,
      'vue-treeselect--focused': isFocused,
      'vue-treeselect--has-value': hasValue,
      'vue-treeselect--open': isOpen,
    } ]"
    @mousedown="handleMouseDown"
    ref="wrapper">
    <div class="vue-treeselect__control">
      <component :is="ValueComponent" ref="value" />
      <div v-if="shouldShowClearIcon" class="vue-treeselect__clear" :title="multiple ? clearAllText : clearValueText" @mousedown="handleMouseDownOnClear">&times;</div>
      <div class="vue-treeselect__arrow-wrapper" @mousedown="handleMouseDownOnArrow">
        <span :class="[ 'vue-treeselect__arrow', { 'vue-treeselect__arrow--rotated': isOpen } ]"></span>
      </div>
    </div>
    <div v-if="isOpen" class="vue-treeselect__menu" :style="{ maxHeight: maxHeight + 'px' }">
      <div v-if="searching && noSearchResults" class="vue-treeselect__no-results-tip">
        <div class="vue-treeselect__icon-wrapper"><span class="vue-treeselect__icon-warning"></span></div>
        <span class="vue-treeselect__no-results-tip-text">{{ noResultsText }}</span>
      </div>
      <div v-else-if="normalizedOptions.length === 0" class="vue-treeselect__no-options-tip">
        <div class="vue-treeselect__icon-wrapper"><span class="vue-treeselect__icon-warning"></span></div>
        <span class="vue-treeselect__no-options-tip-text">{{ noOptionsText }}</span>
      </div>
      <div v-else class="vue-treeselect__list">
        <treeselect-option
          v-for="rootNode in normalizedOptions"
          :node="rootNode"
          :key="rootNode.id"
          />
      </div>
    </div>
  </div>
</template>

<script>
  import treeselectMixin from '../mixins/treeselectMixin'
  import MultiValue from './MultiValue'
  import SingleValue from './SingleValue'
  import TreeselectOption from './Option'

  export default {
    name: 'vue-treeselect',
    components: { TreeselectOption },
    mixins: [ treeselectMixin ],
    computed: {
      ValueComponent() {
        return this.multiple ? MultiValue : SingleValue
      },
    },
  }
</script>

<style src="../style.less" lang="less"></style>
