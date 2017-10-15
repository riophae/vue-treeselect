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
      return this.instance.nodeCheckedStateMap[this.node.id]
    },

    shouldExpand() {
      if (!this.node.isBranch) return false
      return this.instance.searching
        ? this.node.expandsOnSearch
        : this.node.isExpanded
    },
  },

  watch: {
    'node.isExpanded'(newValue) {
      if (newValue === true && !this.node.isLoaded && !this.node.isPending) {
        // load children when expanded
        this.instance.loadChildren(this.node)
      }
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
  },
}
