<script>
  import Vue from 'vue'
  import domAlign from 'dom-align'

  let placeholderEl
  const PortalTarget = {
    name: 'vue-treeselect--portal-target',

    inject: [ 'instance' ],

    methods: {
      updateStyle() {
        const source = this.$el
        const target = this.instance.$el
        const points = this.instance.menu.prefferedOpenDirection === 'below'
          ? [ 'tl', 'bl' ]
          : [ 'tl', 'tl' ]
        domAlign(source, target, { points })
        this.$el.style.width = target.getBoundingClientRect().width + 'px'
      },
    },

    mounted() {
      this.updateStyle()
    },
  }

  export default {
    name: 'vue-treeselect--portal',

    inject: [ 'instance' ],

    computed: {
      enablePortal() {
        return this.instance.appendToBody
      },
    },

    created() {
      this.portalTargetCreated = false
      this.portalTarget = null
    },

    updated() {
      if (this.enablePortal) {
        if (this.portalTargetCreated) {
          this.portalTarget.$forceUpdate()
        } else {
          this.install()
        }
      } else {
        this.teardown()
      }
    },

    destroyed() {
      this.teardown()
    },

    methods: {
      install() {
        this.portalTargetCreated = true

        const el = document.createElement('div')
        document.body.appendChild(el)

        this.portalTarget = new Vue({
          ...PortalTarget,
          el,
          parent: this.instance,
          render: h => {
            // Make sure `vue-treeselect__portal` goes after any other classes.
            const className = [ this.instance.$el.className, 'vue-treeselect__portal' ].join(' ')
            const style = { zIndex: this.instance.zIndex }
            return h('div', { class: className, style }, this.$slots.default)
          },
        })
      },

      teardown() {
        if (!this.portalTargetCreated) return
        this.portalTargetCreated = false

        document.body.removeChild(this.portalTarget.$el)
        this.portalTarget.$el.innerHTML = ''

        this.portalTarget.$destroy()
        this.portalTarget = null
      },
    },

    render(h) {
      if (this.enablePortal) {
        return placeholderEl || (placeholderEl = h('div', {
          style: { display: 'none' },
        }))
      }

      return this.$slots.default[0]
    },
  }
</script>
