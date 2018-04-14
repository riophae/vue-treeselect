<template>
  <div
    :class="[ 'vue-treeselect', {
      'vue-treeselect--single': single,
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
    <template v-if="name && hasValue">
      <HiddenField v-if="single" :stringified-value="stringifyValue(internalValue[0])" />
      <HiddenField v-else-if="joinValues" :stringified-value="internalValue.map(stringifyValue).join(delimiter)" />
      <template v-else>
        <HiddenField v-for="(v, i) in internalValue" :stringified-value="stringifyValue(v)" :key="i" />
      </template>
    </template>
    <div class="vue-treeselect__control">
      <single-value v-if="single" ref="value" />
      <multi-value v-else ref="value" />
      <div v-if="shouldShowX" class="vue-treeselect__x" :title="multiple ? clearAllText : clearValueText" @mousedown="handleMouseDownOnClear">&times;</div>
      <div v-if="!isOpen || !alwaysOpen" class="vue-treeselect__arrow-wrapper" @mousedown="handleMouseDownOnArrow">
        <span :class="[ 'vue-treeselect__arrow', { 'vue-treeselect__arrow--rotated': isOpen } ]" />
      </div>
    </div>
    <div v-if="isOpen" class="vue-treeselect__menu" ref="menu" :style="{ maxHeight: optimizedHeight + 'px' }">
      <template v-if="rootOptionsLoaded">
        <div v-if="searching && noSearchResults" class="vue-treeselect__no-results-tip">
          <div class="vue-treeselect__icon-wrapper"><span class="vue-treeselect__icon-warning" /></div>
          <span class="vue-treeselect__no-results-tip-text">{{ noResultsText }}</span>
        </div>
        <div v-else-if="normalizedOptions.length === 0" class="vue-treeselect__no-options-tip">
          <div class="vue-treeselect__icon-wrapper"><span class="vue-treeselect__icon-warning" /></div>
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
          <div class="vue-treeselect__icon-wrapper"><span class="vue-treeselect__icon-loader" /></div>
          <span class="vue-treeselect__loading-tip-text">{{ loadingText }}</span>
        </div>
        <div v-else-if="loadingRootOptionsError" class="vue-treeselect__error-tip">
          <div class="vue-treeselect__icon-wrapper"><span class="vue-treeselect__icon-error" /></div>
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
  import HiddenField from './HiddenField'
  import MultiValue from './MultiValue'
  import SingleValue from './SingleValue'
  import TreeselectOption from './Option'

  export default {
    name: 'vue-treeselect',
    components: { HiddenField, MultiValue, SingleValue, TreeselectOption },
    mixins: [ treeselectMixin ],
  }
</script>
