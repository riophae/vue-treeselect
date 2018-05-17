<template>
  <div
    :class="[ 'vue-treeselect', {
      'vue-treeselect--single': single,
      'vue-treeselect--multi': multiple,
      'vue-treeselect--searchable': searchable,
      'vue-treeselect--disabled': disabled,
      'vue-treeselect--focused': trigger.isFocused,
      'vue-treeselect--has-value': hasValue,
      'vue-treeselect--open': menu.isOpen,
      'vue-treeselect--open-above': menu.prefferedOpenDirection === 'above',
      'vue-treeselect--open-below': menu.prefferedOpenDirection === 'below',
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
      <div v-if="shouldShowX" class="vue-treeselect__x-container" :title="multiple ? clearAllText : clearValueText" @mousedown="handleMouseDownOnClear">
        <delete-icon class="vue-treeselect__x" />
      </div>
      <div v-if="!menu.isOpen || !alwaysOpen" class="vue-treeselect__control-arrow-container" @mousedown="handleMouseDownOnArrow">
        <arrow-icon :class="[ 'vue-treeselect__control-arrow', { 'vue-treeselect__control-arrow--rotated': menu.isOpen } ]" />
      </div>
    </div>
    <transition name="vue-treeselect__menu--transition">
      <div v-if="menu.isOpen" class="vue-treeselect__menu" ref="menu" :style="{ maxHeight: menu.optimizedHeight + 'px' }">
        <template v-if="forest.isLoaded">
          <tip v-if="localSearch.active && localSearch.noResults" type="no-results" icon="warning">{{ noResultsText }}</tip>
          <tip v-else-if="forest.normalizedOptions.length === 0" type="no-options" icon="warning">{{ noOptionsText }}</tip>
          <div v-else class="vue-treeselect__list">
            <treeselect-option v-for="rootNode in forest.normalizedOptions" :node="rootNode" :key="rootNode.id">
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
          <tip v-if="loading || forest.isLoading" type="loading" icon="loader">{{ loadingText }}</tip>
          <tip v-else-if="forest.loadingError" type="error" icon="error">
            {{ forest.loadingError }}
            <a class="vue-treeselect__retry" @click="loadRootOptions" :title="retryTitle">
              {{ retryText }}
            </a>
          </tip>
        </template>
      </div>
    </transition>
  </div>
</template>

<script>
  import treeselectMixin from '../mixins/treeselectMixin'
  import HiddenField from './HiddenField'
  import MultiValue from './MultiValue'
  import SingleValue from './SingleValue'
  import TreeselectOption from './Option'
  import Tip from './Tip'
  import ArrowIcon from './icons/Arrow'
  import DeleteIcon from './icons/Delete'

  export default {
    name: 'vue-treeselect',
    components: { HiddenField, MultiValue, SingleValue, TreeselectOption, Tip, ArrowIcon, DeleteIcon },
    mixins: [ treeselectMixin ],
  }
</script>
