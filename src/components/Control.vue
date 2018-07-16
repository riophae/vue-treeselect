<script>
  import { onLeftClick, isPromise } from '../utils'
  import SingleValue from './SingleValue'
  import MultiValue from './MultiValue'
  import ArrowIcon from './icons/Arrow'
  import DeleteIcon from './icons/Delete'

  export default {
    name: 'vue-treeselect--control',
    inject: [ 'instance' ],

    computed: {
      shouldShowArrow() {
        const { instance } = this

        if (!instance.alwaysOpen) return true
        // Even with `alwaysOpen: true`, sometimes the menu is still closed,
        // e.g. when the control is disabled.
        return !instance.menu.isOpen
      },

      shouldShowX() {
        const { instance } = this

        return (
          instance.clearable &&
          !instance.disabled &&
          instance.hasUndisabledValue
        )
      },
    },

    methods: {
      renderX() {
        const { instance } = this

        if (!this.shouldShowX) return null

        const title = instance.multiple ? instance.clearAllText : instance.clearValueText

        return (
          <div class="vue-treeselect__x-container" title={title} onMousedown={this.handleMouseDownOnX}>
            <DeleteIcon class="vue-treeselect__x" />
          </div>
        )
      },

      renderArrow() {
        const { instance } = this

        if (!this.shouldShowArrow) return null

        const arrowClass = {
          'vue-treeselect__control-arrow': true,
          'vue-treeselect__control-arrow--rotated': instance.menu.isOpen,
        }

        return (
          <div class="vue-treeselect__control-arrow-container" onMousedown={this.handleMouseDownOnArrow}>
            <ArrowIcon class={arrowClass} />
          </div>
        )
      },

      handleMouseDownOnX: onLeftClick(function handleMouseDownOnX(evt) {
        /**
         * We don't use async/await here because we don't want
         * to rely on Babel polyfill or regenerator runtime.
         * See: https://babeljs.io/docs/plugins/transform-regenerator/
         * We also don't want to assume there is a global `Promise`
         * class, since we are targeting to support IE9 without the
         * need of any polyfill.
         */

        const { instance } = this

        evt.stopPropagation()
        evt.preventDefault()

        const result = instance.beforeClearAll()
        const handler = shouldClear => {
          if (shouldClear) {
            instance.clear()
          }

          instance.focusInput()
        }

        if (isPromise(result)) {
          // The handler will be called async.
          result.then(handler)
        } else {
          // Keep the same behavior here.
          setTimeout(() => handler(result), 0)
          // Also, note that IE9 requires:
          //   setTimeout(() => fn(...args), delay)
          // Instead of:
          //   setTimeout(fn, delay, ...args)
        }
      }),

      handleMouseDownOnArrow: onLeftClick(function handleMouseDownOnArrow(evt) {
        const { instance } = this

        evt.preventDefault()
        evt.stopPropagation()

        // Focus the input or prevent blurring.
        instance.focusInput()
        instance.toggleMenu()
      }),

      // This is meant to be called by child `<Value />` component.
      renderValueContainer(children) {
        return (
          <div class="vue-treeselect__value-container">
            {children}
          </div>
        )
      },
    },

    render() {
      const { instance } = this
      const ValueContainer = instance.single ? SingleValue : MultiValue

      return (
        <div class="vue-treeselect__control" onMousedown={instance.handleMouseDown}>
          <ValueContainer ref="value-container" />
          {this.renderX()}
          {this.renderArrow()}
        </div>
      )
    },
  }
</script>
