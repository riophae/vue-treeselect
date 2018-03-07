<template>
  <label :class="CN__VUE_TREESELECT__LABLE">
    {{ node.label }}
    <span v-if="shouldShowCount" :class="CN__VUE_TREESELECT__COUNT">({{ count }})</span>
  </label>
</template>

<script>
  import optionLabelMixin from '../mixins/optionLabelMixin'

  export default {
    mixins: [ optionLabelMixin ],
  }
</script>
