export default {
  name: 'vue-treeselect--option-label',
  props: {
    node: {
      type: Object,
      required: true,
    },
    shouldShowCount: {
      type: Boolean,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
  },
  computed: {
    CN__VUE_TREESELECT__LABLE() {
      return 'vue-treeselect__label'
    },
    CN__VUE_TREESELECT__COUNT() {
      return 'vue-treeselect__count'
    },
  },
}
