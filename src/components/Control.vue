<script>
  import { onLeftClick, isPromise } from '../utils'
  import SingleValue from './SingleValue'
  import MultiValue from './MultiValue'
  import DeleteIcon from './icons/Delete'
  import ArrowIcon from './icons/Arrow'

  export default {
    name: 'vue-treeselect--control',
    inject: [ 'instance' ],

    computed: {
      /* eslint-disable valid-jsdoc */
      /**
       * Should show the "×" button that resets value?
       * @return {boolean}
       */
      shouldShowX() {
        const { instance } = this

        return (
          instance.clearable &&
          !instance.disabled &&
          instance.hasValue &&
          (this.hasUndisabledValue || instance.allowClearingDisabled)
        )
      },

      /**
       * Should show the arrow button that toggles menu?
       * @return {boolean}
       */
      shouldShowArrow() {
        const { instance } = this

        if (!instance.alwaysOpen) return true
        // Even with `alwaysOpen: true`, sometimes the menu is still closed,
        // e.g. when the control is disabled.
        return !instance.menu.isOpen
      },

      /**
       * Has any undisabled option been selected?
       * @type {boolean}
       */
      hasUndisabledValue() {
        const { instance } = this

        return (
          instance.hasValue &&
          instance.internalValue.some(id => !instance.getNode(id).isDisabled)
        )
      },
      /* eslint-enable valid-jsdoc */
    },

    methods: {
      renderX() {
        const { instance } = this
        const title = instance.multiple ? instance.clearAllText : instance.clearValueText

        if (!this.shouldShowX) return null

        return (
          <div class="vue-treeselect__x-container" title={title} onMousedown={this.handleMouseDownOnX}>
            <DeleteIcon class="vue-treeselect__x" />
          </div>
        )
      },

      renderArrow() {
        const { instance } = this
        const arrowClass = {
          'vue-treeselect__control-arrow': true,
          'vue-treeselect__control-arrow--rotated': instance.menu.isOpen,
        }

        if (!this.shouldShowArrow) return null

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

        evt.stopPropagation()
        evt.preventDefault()

        const { instance } = this
        const result = instance.beforeClearAll()
        const handler = shouldClear => {
          if (shouldClear) instance.clear()
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
        evt.preventDefault()
        evt.stopPropagation()

        const { instance } = this

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
