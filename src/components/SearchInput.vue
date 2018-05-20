<script>
  import { deepExtend } from '../utils'
  import { MIN_INPUT_WIDTH, KEY_CODES } from '../constants'

  const keysThatRequireMenuBeingOpen = [
    KEY_CODES.ENTER,
    KEY_CODES.END,
    KEY_CODES.HOME,
    KEY_CODES.ARROW_LEFT,
    KEY_CODES.ARROW_UP,
    KEY_CODES.ARROW_RIGHT,
    KEY_CODES.ARROW_DOWN,
  ]

  export default {
    name: 'vue-treeselect--input',
    inject: [ 'instance' ],

    data: () => ({
      inputWidth: MIN_INPUT_WIDTH,
    }),

    computed: {
      needsAutoSize() {
        return (
          this.instance.searchable &&
          !this.instance.disabled &&
          this.instance.multiple
        )
      },
    },

    updated() {
      // istanbul ignore else
      if (this.needsAutoSize) this.updateInputWidth()
    },

    methods: {
      focus() {
        if (!this.instance.disabled) {
          this.$refs.input && this.$refs.input.focus()
        }
      },

      blur() {
        this.$refs.input && this.$refs.input.blur()
      },

      onFocus() {
        this.instance.trigger.isFocused = true
        // istanbul ignore else
        if (this.instance.openOnFocus) this.instance.openMenu()
      },

      onBlur() {
        // #15
        // istanbul ignore next
        if (document.activeElement === this.instance.$refs.menu) {
          this.focus()
          return
        }

        this.instance.trigger.isFocused = false
        this.instance.closeMenu()
      },

      onInput(evt) {
        this.instance.trigger.searchQuery = evt.target.value
      },

      // 用 keyUp 事件存在一个问题，删除输入框最后一个字符也会导致取消选中最后一项
      onKeyDown(evt) {
        if (evt.ctrlKey || evt.shiftKey || evt.altKey || evt.metaKey)
          return

        // https://css-tricks.com/snippets/javascript/javascript-keycodes/
        // https://stackoverflow.com/questions/4471582/javascript-keycode-vs-which
        const key = 'which' in evt ? evt.which : /* istanbul ignore next */ evt.keyCode
        if (!this.instance.menu.isOpen && keysThatRequireMenuBeingOpen.indexOf(key) !== -1) {
          evt.preventDefault()
          return this.instance.openMenu()
        }

        switch (key) {
        case KEY_CODES.BACKSPACE: {
          if (this.instance.backspaceRemoves && !this.instance.trigger.searchQuery.length) {
            this.instance.removeLastValue()
          }
          break
        }
        case KEY_CODES.ENTER: {
          evt.preventDefault()
          const current = this.instance.getNode(this.instance.menu.current)
          if (current.isBranch && this.instance.disableBranchNodes) return
          this.instance.select(current)
          break
        }
        case KEY_CODES.ESCAPE: {
          if (this.instance.trigger.searchQuery.length) {
            this.instance.trigger.searchQuery = ''
          } else if (this.instance.menu.isOpen) {
            this.instance.closeMenu()
          } else if (this.instance.escapeClearsValue) {
            this.instance.clear()
          }
          break
        }
        case KEY_CODES.END: {
          evt.preventDefault()
          this.instance.highlightLastOption()
          break
        }
        case KEY_CODES.HOME: {
          evt.preventDefault()
          this.instance.highlightFirstOption()
          break
        }
        case KEY_CODES.ARROW_LEFT: {
          const current = this.instance.getNode(this.instance.menu.current)
          if (current.isBranch && this.instance.shouldExpand(current)) {
            evt.preventDefault()
            this.instance.toggleExpanded(current)
          } else if (!current.isRootNode && (current.isLeaf || (current.isBranch && !(this.instance.shouldExpand(current))))) {
            evt.preventDefault()
            this.instance.setCurrentHighlightedOption(current.parentNode)
          }
          break
        }
        case KEY_CODES.ARROW_UP: {
          evt.preventDefault()
          this.instance.highlightPrevOption()
          break
        }
        case KEY_CODES.ARROW_RIGHT: {
          const current = this.instance.getNode(this.instance.menu.current)
          if (current.isBranch && !this.instance.shouldExpand(current)) {
            evt.preventDefault()
            this.instance.toggleExpanded(current)
          }
          break
        }
        case KEY_CODES.ARROW_DOWN: {
          evt.preventDefault()
          this.instance.highlightNextOption()
          break
        }
        case KEY_CODES.DELETE: {
          if (this.instance.deleteRemoves && !this.instance.trigger.searchQuery.length) {
            this.instance.removeLastValue()
          }
          break
        }
        default: {
          // istanbul ignore else
          this.instance.openMenu()
        }
        }
      },

      onMouseDown(evt) {
        // istanbul ignore next
        if (this.instance.trigger.searchQuery.length) {
          // Prevent it from bubbling to the top level and triggering `preventDefault()`
          // to make the textbox unselectable
          evt.stopPropagation()
        }
      },

      renderInputContainer(h) {
        const props = {
          class: 'vue-treeselect__input-container',
        }
        const children = []

        if (this.instance.searchable && !this.instance.disabled) {
          children.push(this.renderInput(h))
          if (this.needsAutoSize) children.push(this.renderSizer(h))
        }

        if (!this.instance.searchable) {
          deepExtend(props, {
            on: {
              focus: this.onFocus,
              blur: this.onBlur,
              keydown: this.onKeyDown,
            },
            ref: 'input',
          })
        }

        if (!this.instance.searchable && !this.instance.disabled) {
          deepExtend(props, {
            attrs: {
              tabIndex: this.instance.tabIndex,
            },
          })
        }

        return h('div', props, children)
      },

      renderInput(h) {
        return h('input', {
          class: 'vue-treeselect__input',
          attrs: {
            type: 'text',
            autocomplete: 'off',
            tabIndex: this.instance.tabIndex,
            required: this.instance.required && !this.instance.hasValue,
          },
          domProps: {
            value: this.instance.trigger.searchQuery,
          },
          style: {
            width: this.needsAutoSize ? `${this.inputWidth}px` : null,
          },
          on: {
            focus: this.onFocus,
            input: this.onInput,
            blur: this.onBlur,
            keydown: this.onKeyDown,
            mousedown: this.onMouseDown,
          },
          ref: 'input',
        })
      },

      renderSizer(h) {
        return h('div', {
          class: 'vue-treeselect__sizer',
          domProps: {
            textContent: this.instance.trigger.searchQuery,
          },
          ref: 'sizer',
        })
      },

      updateInputWidth() {
        this.inputWidth = Math.max(
          MIN_INPUT_WIDTH,
          this.$refs.sizer.scrollWidth + 15,
        )
      },
    },

    render(h) {
      return this.renderInputContainer(h)
    },
  }
</script>
