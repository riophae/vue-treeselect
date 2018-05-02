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
      <div v-if="shouldShowArrorPlaceholder" class="vue-treeselect__option-arrow-placeholder">&nbsp;</div>
      <div v-else-if="node.isBranch" class="vue-treeselect__option-arrow-wrapper" @mousedown="handleMouseDownOnOptionArrow">
        <transition name="vue-treeselect__option-arrow--prepare" appear>
          <arrow :class="[ 'vue-treeselect__option-arrow', { 'vue-treeselect__option-arrow--rotated': shouldExpand } ]" />
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
            <check-mark class="vue-treeselect__check-mark" />
            <minus-mark class="vue-treeselect__minus-mark" />
          </span>
        </div>
        <slot name="option-label" :node="node" :should-show-count="shouldShowCount" :count="count"
          label-class-name="vue-treeselect__label" count-class-name="vue-treeselect__count" />
      </div>
    </div>
    <div v-if="shouldExpand" class="vue-treeselect__list">
      <template v-if="node.isLoaded">
        <template v-if="node.children.length">
          <vue-treeselect--option v-for="childNode in node.children" :node="childNode" :key="childNode.id">
            <template slot="option-label" slot-scope="{ node, shouldShowCount, count, labelClassName, countClassName }">
              <slot name="option-label" :node="node" :should-show-count="shouldShowCount" :count="count"
                :label-class-name="labelClassName" :count-class-name="countClassName" />
            </template>
          </vue-treeselect--option>
        </template>
        <tip v-else type="no-children" icon="warning">{{ instance.noChildrenText }}</tip>
      </template>
      <tip v-else-if="node.isPending" type="loading" icon="loader">{{ instance.loadingText }}</tip>
      <tip v-else-if="node.loadingChildrenError" type="error" icon="error">
        {{ node.loadingChildrenError }}
        <a class="vue-treeselect__retry" @click="instance.loadChildrenOptions(node)" :title="instance.retryTitle">
          {{ instance.retryText }}
        </a>
      </tip>
    </div>
  </div>
</template>

<script>
  import optionMixin from '../mixins/optionMixin'
  import Tip from './Tip'
  import Arrow from './Arrow'
  import CheckMark from './CheckMark'
  import MinusMark from './MinusMark'

  export default {
    name: 'vue-treeselect--option',
    inject: [ 'instance', 'UNCHECKED', 'INDETERMINATE', 'CHECKED' ],
    components: { Tip, Arrow, CheckMark, MinusMark },
    mixins: [ optionMixin ],
  }
</script>
