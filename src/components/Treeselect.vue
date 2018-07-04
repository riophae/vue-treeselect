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
      'vue-treeselect--append-to-body': appendToBody,
    } ]"
    ref="wrapper">
    <template v-if="name && !disabled && hasValue">
      <HiddenField v-if="single" :stringified-value="stringifyValue(internalValue[0])" />
      <HiddenField v-else-if="joinValues" :stringified-value="internalValue.map(stringifyValue).join(delimiter)" />
      <template v-else>
        <HiddenField v-for="(v, i) in internalValue" :stringified-value="stringifyValue(v)" :key="i" />
      </template>
    </template>
    <div class="vue-treeselect__control" @mousedown="handleMouseDown">
      <single-value v-if="single" ref="value" />
      <multi-value v-else ref="value" />
      <div v-if="shouldShowX" class="vue-treeselect__x-container" :title="multiple ? clearAllText : clearValueText" @mousedown="handleMouseDownOnClear">
        <delete-icon class="vue-treeselect__x" />
      </div>
      <div v-if="shouldShowControlArrow" class="vue-treeselect__control-arrow-container" @mousedown="handleMouseDownOnArrow">
        <arrow-icon :class="[ 'vue-treeselect__control-arrow', { 'vue-treeselect__control-arrow--rotated': menu.isOpen } ]" />
      </div>
    </div>
    <portal>
      <transition name="vue-treeselect__menu--transition">
        <div v-if="shouldShowMenu" class="vue-treeselect__menu" ref="menu" @mousedown="handleMouseDown" :style="{ maxHeight: menu.optimizedHeight + 'px' }">
          <div v-if="shouldShowOptionsList" class="vue-treeselect__list">
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
          <tip v-if="shouldShowNoResultsTip" type="no-results" icon="warning">{{ noResultsText }}</tip>
          <tip v-if="shouldShowNoOptionsTip" type="no-options" icon="warning">{{ noOptionsText }}</tip>
          <tip v-if="shouldShowLoadingOptionsTip" type="loading" icon="loader">{{ loadingText }}</tip>
          <tip v-if="shouldShowLoadingRootOptionsErrorTip" type="error" icon="error">
            {{ rootOptionsStates.loadingError }}
            <a class="vue-treeselect__retry" @click="loadRootOptions" :title="retryTitle">
              {{ retryText }}
            </a>
          </tip>
          <tip v-if="shouldShowAsyncSearchLoadingErrorTiop" type="error" icon="error">
            {{ getRemoteSearchEntry().loadingError }}
            <a class="vue-treeselect__retry" @click="handleRemoteSearch()" :title="retryTitle">
              {{ retryText }}
            </a>
          </tip>
          <tip v-if="shouldShowSearchPromptTip" type="search-prompt" icon="warning">{{ searchPromptText }}</tip>
        </div>
      </transition>
    </portal>
  </div>
</template>

<script>
  import treeselectMixin from '../mixins/treeselectMixin'
  import Portal from './Portal'
  import HiddenField from './HiddenField'
  import MultiValue from './MultiValue'
  import SingleValue from './SingleValue'
  import TreeselectOption from './Option'
  import Tip from './Tip'
  import ArrowIcon from './icons/Arrow'
  import DeleteIcon from './icons/Delete'

  export default {
    name: 'vue-treeselect',
    components: { Portal, HiddenField, MultiValue, SingleValue, TreeselectOption, Tip, ArrowIcon, DeleteIcon },
    mixins: [ treeselectMixin ],
  }
</script>
