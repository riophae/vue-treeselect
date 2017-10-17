import { onlyOnLeftClick } from '../utils'

export default {
  computed: {
    limitText() {
      const count = this.instance.selectedNodesNumber - this.instance.limit
      return this.instance.limitText(count)
    },
  },

  methods: {
    focusInput() {
      this.$refs.input.focus()
    },

    blurInput() {
      this.$refs.input.blur()
    },

    handleMouseDownOnValue: onlyOnLeftClick(function handleMouseDownOnValue(evt) {
      /* istanbul ignore next */
      if (!this.instance.isOpen) {
        // If the menu is closed, stop bubbling to
        // prevent the menu from being activated
        evt.stopPropagation()
      }
    }),
  },
}
