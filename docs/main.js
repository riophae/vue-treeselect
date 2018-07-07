import 'script-loader!../static/prism.min.js'
import 'regenerator-runtime/runtime'
import 'yaku/lib/global'
import Vue from 'vue'
import Treeselect from '../src'

import './styles/docs.less'
import './styles/prism.less'

Vue.config.productionTip = false
Vue.component('treeselect', Treeselect)

let sections
function calculateNavPositions() {
  sections = [].map.call(document.querySelectorAll('[data-section]'), section => ({
    id: section.id,
    offset: section.getBoundingClientRect().top + window.pageYOffset - 50,
  }))
}

function loadComponents() {
  const components = {}
  const context = require.context('./components', false, /\.vue$/)
  context.keys().forEach(key => {
    const componentName = key.replace(/^\.\/|\.vue$/g, '')
    components[componentName] = context(key).default
  })
  return components
}

new Vue({
  el: '#app',

  components: loadComponents(),

  data: () => ({
    currentPosition: '',
    isNavSticky: false,
  }),

  mounted() {
    this.adjustNav()
    window.addEventListener('scroll', this.adjustNav)
    setTimeout(calculateNavPositions, 1000)
  },

  methods: {
    adjustNav() {
      const sidebar = document.getElementById('sidebar')
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const offset = sidebar.getBoundingClientRect().top + window.pageYOffset
      this.isNavSticky = scrollTop > offset
      if (!sections) calculateNavPositions()
      for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollTop > sections[i].offset || i === 0) {
          this.currentPosition = sections[i].id
          break
        }
      }
    },
  },
})
