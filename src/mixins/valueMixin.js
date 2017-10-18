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
  },
}
