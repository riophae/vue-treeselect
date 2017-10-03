import Vue from 'vue'
import Treeselect from '../src'

import Demo from './components/Demo'
import BasicFeatures from './components/BasicFeatures'
import MoreFeatures from './components/MoreFeatures'
import DelayedLoading from './components/DelayedLoading'
import FlatModeAndSortingValue from './components/FlatModeAndSortingValue'
import DisablingBranchNodes from './components/DisablingBranchNodes'
import DocProps from './components/DocProps'
import DocEvents from './components/DocEvents'

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

new Vue({
  components: {
    Demo,
    BasicFeatures,
    MoreFeatures,
    DelayedLoading,
    FlatModeAndSortingValue,
    DisablingBranchNodes,
    DocProps,
    DocEvents,
  },

  el: '#app',

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
