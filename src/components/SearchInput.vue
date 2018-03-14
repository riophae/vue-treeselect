<script>
  import { deepExtend } from '../utils'

  const MIN_INPUT_WIDTH = 5
  const KEY_CODES = {
    BACKSPACE: 8,
    ESCAPE: 27,
    DELETE: 46,
  }

  export default {
    name: 'vue-treeselect--input',
    inject: [ 'instance' ],

    data: () => ({
      inputWidth: MIN_INPUT_WIDTH,
    }),

    computed: {
      needsAutoSize() {
        return this.instance.multiple
      },
    },

    updated() {
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
        this.instance.isFocused = true
        // istanbul ignore else
        if (!this.instance.isOpen && this.instance.openOnFocus) {
          this.instance.openMenu()
        }
      },

      onBlur() {
        // #15
        // istanbul ignore next
        if (document.activeElement === this.instance.$refs.menu) {
          this.focus()
          return
        }

        this.instance.isFocused = false
        this.instance.closeMenu()
      },

      onInput(evt) {
        this.instance.searchQuery = evt.target.value
      },

      // 用 keyUp 事件存在一个问题，删除输入框最后一个字符也会导致取消选中最后一项
      onKeyDown(evt) {
        if (evt.ctrlKey || evt.shiftKey || evt.altKey || evt.metaKey)
          return

        // https://css-tricks.com/snippets/javascript/javascript-keycodes/
        // https://stackoverflow.com/questions/4471582/javascript-keycode-vs-which
        switch (/* istanbul ignore next */ 'which' in evt ? evt.which : evt.keyCode) {
        case KEY_CODES.BACKSPACE: {
          if (this.instance.backspaceRemoves && !this.instance.searchQuery.length) {
            this.instance.maybeRemoveLastValue()
          }
          break
        }
        case KEY_CODES.DELETE: {
          if (this.instance.deleteRemoves && !this.instance.searchQuery.length) {
            this.instance.maybeRemoveLastValue()
          }
          break
        }
        case KEY_CODES.ESCAPE: {
          if (this.instance.searchQuery.length) {
            this.instance.searchQuery = ''
          } else if (this.instance.isOpen) {
            this.instance.closeMenu()
          } else if (this.instance.escapeClearsValue) {
            this.instance.clear()
          }
          break
        }
        default: {
          // istanbul ignore else
          if (!this.instance.isOpen) {
            this.instance.openMenu()
          }
        }
        }
      },

      onMouseDown(evt) {
        // istanbul ignore next
        if (this.instance.searchQuery.length) {
          // Prevent it from bubbling to the top level and triggering `preventDefault()`
          // to make the textbox unselectable
          evt.stopPropagation()
        }
      },

      renderInputWrapper(h) {
        const props = {
          class: 'vue-treeselect__input-wrapper',
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
          },
          domProps: {
            value: this.instance.searchQuery,
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
            textContent: this.instance.searchQuery,
          },
          ref: 'sizer',
        })
      },

      updateInputWidth() {
        this.inputWidth = Math.max(
          MIN_INPUT_WIDTH,
          this.$refs.sizer
            ? this.$refs.sizer.scrollWidth + 5
            : /* istanbul ignore next */ 0,
        )
      },
    },

    render(h) {
      return this.renderInputWrapper(h)
    },
  }
</script>
