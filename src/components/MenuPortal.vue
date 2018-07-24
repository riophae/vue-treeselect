<script>
  import Vue from 'vue'
  import domAlign from 'dom-align'
  import watchSize from 'watch-size'
  import Menu from './Menu'

  const PortalTarget = {
    name: 'vue-treeselect--portal-target',
    inject: [ 'instance' ],

    watch: {
      'instance.menu.isOpen'(newValue) {
        if (newValue) this.updateStyle()
      },
    },

    created() {
      this._stopWatchingSize = null
    },

    methods: {
      updateStyle() {
        const { instance } = this
        const source = this.$el
        const target = instance.$el
        const points = instance.menu.prefferedOpenDirection === 'below'
          ? [ 'tl', 'bl' ]
          : [ 'tl', 'tl' ]

        domAlign(source, target, { points })
        source.style.width = target.getBoundingClientRect().width + 'px'
      },
    },

    render() {
      const { instance } = this
      const className = [ 'vue-treeselect__portal-target', instance.wrapperClass ]
      const style = { zIndex: instance.zIndex }

      return (
        <div class={className} style={style}>
          <Menu ref="menu" />
        </div>
      )
    },

    mounted() {
      const { instance } = this
      const $control = instance.getControl()

      this._stopWatchingSize = watchSize($control, this.updateStyle)
      this.updateStyle()
    },

    destroyed() {
      this._stopWatchingSize()
    },
  }

  let placeholder

  export default {
    name: 'vue-treeselect--menu-portal',

    created() {
      this.portalTarget = null
    },

    mounted() {
      this.install()
    },

    destroyed() {
      this.teardown()
    },

    methods: {
      install() {
        const el = document.createElement('div')
        document.body.appendChild(el)

        this.portalTarget = new Vue({
          el,
          parent: this,
          ...PortalTarget,
        })
      },

      teardown() {
        document.body.removeChild(this.portalTarget.$el)
        this.portalTarget.$el.innerHTML = ''

        this.portalTarget.$destroy()
        this.portalTarget = null
      },
    },

    render() {
      if (!placeholder) placeholder = (
        <div class="vue-treeselect__menu-placeholder" />
      )

      return placeholder
    },
  }
</script>
