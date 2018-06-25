import { onlyOnLeftClick } from '../utils'

export default {
  props: {
    node: {
      type: Object,
      required: true,
    },
  },

  computed: {
    checkedState() {
      return this.instance.forest.checkedStateMap[this.node.id]
    },

    shouldExpand() {
      if (!this.node.isBranch) return false
      return this.instance.shouldExpand(this.node)
    },

    shouldShowCount() {
      if (!this.node.isBranch) return false
      return this.instance.localSearch.active
        ? this.instance.showCountOnSearchComputed
        : this.instance.showCount
    },

    count() {
      if (!this.shouldShowCount) return NaN
      return this.instance.localSearch.active
        ? this.instance.localSearch.countMap[this.node.id][this.instance.showCountOf]
        : this.node.count[this.instance.showCountOf]
    },

    shouldShowArrorPlaceholder() {
      if (this.node.isBranch) return false
      return this.node.isLeaf && this.instance.hasBranchNodes
    },
  },

  methods: {
    handleMouseDownOnOption: onlyOnLeftClick(function handleMouseDownOnOptionArrow() {
      if (this.node.isBranch && this.instance.disableBranchNodes) {
        this.instance.toggleExpanded(this.node)
      } else {
        this.instance.select(this.node)
      }
    }),

    handleMouseDownOnOptionArrow: onlyOnLeftClick(function handleMouseDownOnOptionArrow() {
      this.instance.toggleExpanded(this.node)
    }),

    setCurrentHighlightedOption() {
      this.instance.setCurrentHighlightedOption(this.node, false)
    },
  },
}
