export default {
  props: {
    node: {
      type: Object,
      required: true,
    },
  },

  computed: {
    checkedState() {
      return this.instance.nodeCheckedStateMap[this.node.id]
    },

    shouldExpand() {
      if (!this.node.isBranch) return false
      return this.instance.searching
        ? this.node.expandsOnSearch
        : this.node.isExpanded
    },

    shouldShowCount() {
      if (!this.node.isBranch) return false
      return this.instance.searching
        ? this.instance.showCountOnSearch
        : this.instance.showCount
    },
  },

  watch: {
    'node.isExpanded'(newValue) {
      if (newValue === true && !this.node.isLoaded) {
        // load children when expanded
        this.instance.loadChildren(this.node)
      }
    },
  },

  methods: {
    handleClickOnOption() {
      if (this.node.isBranch && this.instance.disableBranchNodes) {
        this.instance.toggleExpanded(this.node)
      } else {
        this.instance.select(this.node)
      }
    },

    handleClickOnOptionArrow() {
      this.instance.toggleExpanded(this.node)
    },
  },
}
