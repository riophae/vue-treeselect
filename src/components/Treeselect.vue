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
      'vue-treeselect--open-above': prefferedOpenDirection === 'above',
      'vue-treeselect--open-below': prefferedOpenDirection === 'below',
      'vue-treeselect--branch-nodes-disabled': disableBranchNodes,
    } ]"
    @mousedown="handleMouseDown"
    ref="wrapper">
    <div class="vue-treeselect__control">
      <component :is="ValueComponent" ref="value" />
      <div v-if="shouldShowClearIcon" class="vue-treeselect__clear" :title="multiple ? clearAllText : clearValueText" @mousedown="handleMouseDownOnClear">&times;</div>
      <div class="vue-treeselect__arrow-wrapper" @mousedown="handleMouseDownOnArrow" v-if="!alwaysOpen">
        <span :class="[ 'vue-treeselect__arrow', { 'vue-treeselect__arrow--rotated': isOpen } ]"></span>
      </div>
    </div>
    <div v-if="isOpen" class="vue-treeselect__menu" ref="menu" :style="{ maxHeight: optimizedHeight + 'px' }">
      <template v-if="rootOptionsLoaded">
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
            >
            <template slot="option-label" slot-scope="{ node, shouldShowCount, count, labelClassName, countClassName }">
              <slot name="option-label" :node="node" :should-show-count="shouldShowCount" :count="count"
                :label-class-name="labelClassName" :count-class-name="countClassName">
                <label :class="labelClassName">
                  {{ node.label }}
                  <span v-if="shouldShowCount" :class="countClassName">({{ count }})</span>
                </label>
              </slot>
            </template>
          </treeselect-option>
        </div>
      </template>
      <template v-else>
        <div v-if="loadingRootOptions" class="vue-treeselect__loading-tip">
          <div class="vue-treeselect__icon-wrapper"><span class="vue-treeselect__icon-loader"></span></div>
          <span class="vue-treeselect__loading-tip-text">{{ loadingText }}</span>
        </div>
        <div v-else-if="loadingRootOptionsError" class="vue-treeselect__error-tip">
          <div class="vue-treeselect__icon-wrapper"><span class="vue-treeselect__icon-error"></span></div>
          <span class="vue-treeselect__error-tip-text">
            Failed to load options: {{ loadingRootOptionsError }}.
            <a class="vue-treeselect__retry" @click="loadOptions(true)" :title="retryTitle">
              {{ retryText }}
            </a>
          </span>
        </div>
      </template>
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
