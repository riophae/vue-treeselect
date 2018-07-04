<script>
  import Vue from 'vue'
  import domAlign from 'dom-align'

  let placeholderEl
  const Portal = {
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
      this.portalCreated = false
      this.portal = null
    },

    updated() {
      if (this.enablePortal) {
        if (this.portalCreated) {
          this.portal.$forceUpdate()
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
        this.portalCreated = true

        const el = document.createElement('div')
        document.body.appendChild(el)

        this.portal = new Vue({
          ...Portal,
          el,
          parent: this.instance,
          render: h => {
            // Make sure `vue-treeselect__portal` goes after any other classes.
            const className = [ this.instance.$el.className, 'vue-treeselect__portal' ].join(' ')
            return h('div', { class: className }, this.$slots.default)
          },
        })
      },

      teardown() {
        if (!this.portalCreated) return
        this.portalCreated = false

        document.body.removeChild(this.portal.$el)
        this.portal.$el.innerHTML = ''

        this.portal.$destroy()
        this.portal = null
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
