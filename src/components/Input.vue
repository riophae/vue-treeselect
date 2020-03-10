<script>
  import { debounce, deepExtend, includes } from '../utils'
  import { MIN_INPUT_WIDTH, KEY_CODES, INPUT_DEBOUNCE_DELAY } from '../constants'

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
      value: '',
    }),

    computed: {
      needAutoSize() {
        const { instance } = this

        return (
          instance.searchable &&
          !instance.disabled &&
          instance.multiple
        )
      },

      inputStyle() {
        return {
          width: this.needAutoSize ? `${this.inputWidth}px` : null,
        }
      },
    },

    watch: {
      'instance.trigger.searchQuery'(newValue) {
        this.value = newValue
      },

      value() {
        // istanbul ignore else
        if (this.needAutoSize) this.$nextTick(this.updateInputWidth)
      },
    },

    created() {
      this.debouncedCallback = debounce(
        this.updateSearchQuery,
        INPUT_DEBOUNCE_DELAY,
        { leading: true, trailing: true },
      )
    },

    methods: {
      clear() {
        this.onInput({
          target: { value: '' },
        })
      },

      focus() {
        const { instance } = this

        if (!instance.disabled) {
          this.$refs.input && this.$refs.input.focus()
        }
      },

      blur() {
        this.$refs.input && this.$refs.input.blur()
      },

      onFocus() {
        const { instance } = this

        instance.trigger.isFocused = true
        // istanbul ignore else
        if (instance.openOnFocus) instance.openMenu()
      },

      onBlur() {
        const { instance } = this
        const menu = instance.getMenu()

        // #15
        // istanbul ignore next
        if (menu && document.activeElement === menu) {
          return this.focus()
        }

        instance.trigger.isFocused = false
        instance.closeMenu()
      },

      onInput(evt) {
        const { value } = evt.target

        this.value = value

        if (value) {
          this.debouncedCallback()
        } else {
          this.debouncedCallback.cancel()
          this.updateSearchQuery()
        }
      },

      // 用 keyUp 事件存在一个问题，删除输入框最后一个字符也会导致取消选中最后一项
      onKeyDown(evt) {
        const { instance } = this
        // https://css-tricks.com/snippets/javascript/javascript-keycodes/
        // https://stackoverflow.com/questions/4471582/javascript-keycode-vs-which
        const key = 'which' in evt ? evt.which : /* istanbul ignore next */ evt.keyCode

        if (evt.ctrlKey || evt.shiftKey || evt.altKey || evt.metaKey)
          return

        if (!instance.menu.isOpen && includes(keysThatRequireMenuBeingOpen, key)) {
          evt.preventDefault()
          return instance.openMenu()
        }

        switch (key) {
        case KEY_CODES.BACKSPACE: {
          if (instance.backspaceRemoves && !this.value.length) {
            instance.removeLastValue()
          }
          break
        }
        case KEY_CODES.ENTER: {
          evt.preventDefault()
          if (instance.menu.current === null) return
          const current = instance.getNode(instance.menu.current)
          if (current.isBranch && instance.disableBranchNodes) return
          instance.select(current)
          break
        }
        case KEY_CODES.ESCAPE: {
          if (this.value.length) {
            this.clear()
          } else if (instance.menu.isOpen) {
            instance.closeMenu()
          }
          break
        }
        case KEY_CODES.END: {
          evt.preventDefault()
          instance.highlightLastOption()
          break
        }
        case KEY_CODES.HOME: {
          evt.preventDefault()
          instance.highlightFirstOption()
          break
        }
        case KEY_CODES.ARROW_LEFT: {
          const current = instance.getNode(instance.menu.current)
          if (current.isBranch && instance.shouldExpand(current)) {
            evt.preventDefault()
            instance.toggleExpanded(current)
          } else if (!current.isRootNode && (current.isLeaf || (current.isBranch && !(instance.shouldExpand(current))))) {
            evt.preventDefault()
            instance.setCurrentHighlightedOption(current.parentNode)
          }
          break
        }
        case KEY_CODES.ARROW_UP: {
          evt.preventDefault()
          instance.highlightPrevOption()
          break
        }
        case KEY_CODES.ARROW_RIGHT: {
          const current = instance.getNode(instance.menu.current)
          if (current.isBranch && !instance.shouldExpand(current)) {
            evt.preventDefault()
            instance.toggleExpanded(current)
          }
          break
        }
        case KEY_CODES.ARROW_DOWN: {
          evt.preventDefault()
          instance.highlightNextOption()
          break
        }
        case KEY_CODES.DELETE: {
          if (instance.deleteRemoves && !this.value.length) {
            instance.removeLastValue()
          }
          break
        }
        default: {
          // istanbul ignore else
          instance.openMenu()
        }
        }
      },

      onMouseDown(evt) {
        // istanbul ignore next
        if (this.value.length) {
          // Prevent it from bubbling to the top level and triggering `preventDefault()`
          // to make the textbox unselectable
          evt.stopPropagation()
        }
      },

      renderInputContainer() {
        const { instance } = this
        const props = {}
        const children = []

        if (instance.searchable && !instance.disabled) {
          children.push(this.renderInput())
          if (this.needAutoSize) children.push(this.renderSizer())
        }

        if (!instance.searchable) {
          deepExtend(props, {
            on: {
              focus: this.onFocus,
              blur: this.onBlur,
              keydown: this.onKeyDown,
            },
            ref: 'input',
          })
        }

        if (!instance.searchable && !instance.disabled) {
          deepExtend(props, {
            attrs: {
              tabIndex: instance.tabIndex,
            },
          })
        }

        return (
          <div class="vue-treeselect__input-container" {...props}>
            {children}
          </div>
        )
      },

      renderInput() {
        const { instance } = this

        return (
          <input ref="input"
            class="vue-treeselect__input"
            type="text"
            autocomplete="off"
            tabIndex={instance.tabIndex}
            required={instance.required && !instance.hasValue}
            value={this.value}
            style={this.inputStyle}
            onFocus={this.onFocus}
            onInput={this.onInput}
            onBlur={this.onBlur}
            onKeydown={this.onKeyDown}
            onMousedown={this.onMouseDown}
          />
        )
      },

      renderSizer() {
        return (
          <div ref="sizer" class="vue-treeselect__sizer">{this.value}</div>
        )
      },

      updateInputWidth() {
        this.inputWidth = Math.max(
          MIN_INPUT_WIDTH,
          this.$refs.sizer.scrollWidth + 15,
        )
      },

      updateSearchQuery() {
        const { instance } = this

        instance.trigger.searchQuery = this.value
      },
    },

    render() {
      return this.renderInputContainer()
    },
  }
</script>
