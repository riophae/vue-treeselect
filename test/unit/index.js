import Vue from 'vue'

Vue.config.productionTip = false

function importAll(r) {
  r.keys().forEach(r)
}

importAll(require.context('./specs', true, /\.spec$/))
importAll(require.context('../../src', true))
