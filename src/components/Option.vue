<template>
  <div class="vue-treeselect__list-item">
    <div :class="[ 'vue-treeselect__option', {
      'vue-treeselect__option--disabled': node.isDisabled,
      'vue-treeselect__option--root': node.isRootNode,
      'vue-treeselect__option--child': !node.isRootNode,
      'vue-treeselect__option--selected': instance.isSelected(node),
      'vue-treeselect__option--matched': instance.searching && node.isMatched,
      'vue-treeselect__option--hide': instance.searching && !(node.isMatched || node.hasMatchedChild),
    } ]">
      <div v-if="node.isLeaf" class="vue-treeselect__option-arrow-placeholder">&nbsp;</div>
      <div v-else class="vue-treeselect__option-arrow-wrapper" @mousedown="handleMouseDownOnOptionArrow">
        <transition name="vue-treeselect__option-arrow--prepare" appear>
          <span :class="[ 'vue-treeselect__option-arrow', {
            'vue-treeselect__option-arrow--rotated': shouldExpand,
          } ]" />
        </transition>
      </div>
      <div class="vue-treeselect__label-wrapper" @mousedown="handleMouseDownOnOption">
        <div v-if="instance.multiple && (!instance.disableBranchNodes || node.isLeaf)" class="vue-treeselect__checkbox-wrapper">
          <span :class="[ 'vue-treeselect__checkbox', {
            'vue-treeselect__checkbox--checked': checkedState === CHECKED,
            'vue-treeselect__checkbox--indeterminate': checkedState === INDETERMINATE,
            'vue-treeselect__checkbox--unchecked': checkedState === UNCHECKED,
            'vue-treeselect__checkbox--disabled': node.isDisabled,
          } ]">
            <span class="vue-treeselect__checkbox-mark" />
          </span>
        </div>
        <slot name="option-label" :node="node" :should-show-count="shouldShowCount" :count="count"
          label-class-name="vue-treeselect__label" count-class-name="vue-treeselect__count" />
      </div>
    </div>
    <div v-if="shouldExpand" class="vue-treeselect__list">
      <template v-if="node.isLoaded">
        <template v-if="node.children.length">
          <vue-treeselect--option
            v-for="childNode in node.children"
            :node="childNode"
            :key="childNode.id"
            >
            <template slot="option-label" slot-scope="{ node, shouldShowCount, count, labelClassName, countClassName }">
              <slot name="option-label" :node="node" :should-show-count="shouldShowCount" :count="count"
                :label-class-name="labelClassName" :count-class-name="countClassName" />
            </template>
          </vue-treeselect--option>
        </template>
        <div v-else class="vue-treeselect__no-children-tip">
          <div class="vue-treeselect__icon-wrapper"><span class="vue-treeselect__icon-warning" /></div>
          <span class="vue-treeselect__no-children-tip-text">{{ instance.noChildrenText }}</span>
        </div>
      </template>
      <div v-else-if="node.isPending" class="vue-treeselect__loading-tip">
        <div class="vue-treeselect__icon-wrapper"><span class="vue-treeselect__icon-loader" /></div>
        <span class="vue-treeselect__loading-tip-text">{{ instance.loadingText }}</span>
      </div>
      <div v-else-if="node.loadingChildrenError" class="vue-treeselect__error-tip">
        <div class="vue-treeselect__icon-wrapper"><span class="vue-treeselect__icon-error" /></div>
        <span class="vue-treeselect__error-tip-text">
          {{ node.loadingChildrenError }}
          <a class="vue-treeselect__retry" @click="instance.loadOptions(false, node)" :title="instance.retryTitle">
            {{ instance.retryText }}
          </a>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
  import optionMixin from '../mixins/optionMixin'

  export default {
    name: 'vue-treeselect--option',
    inject: [ 'instance', 'UNCHECKED', 'INDETERMINATE', 'CHECKED' ],
    mixins: [ optionMixin ],
  }
</script>
