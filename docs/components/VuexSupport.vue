<template>
  <div>
    <treeselect
      :options="options"
      :value="value"
      :searchable="false"
      @input="updateValue"
      />
    <treeselect-value :value="value" />
  </div>
</template>

<script>
  import Vue from 'vue'
  import Vuex, { mapState, mapMutations } from 'vuex'
  import { generateOptions } from './utils'

  Vue.use(Vuex)

  const store = new Vuex.Store({
    state: {
      value: 'a',
    },
    mutations: {
      updateValue(state, value) {
        state.value = value
      },
    },
  })

  export default {
    store,

    data: () => ({
      options: generateOptions(2),
    }),

    computed: {
      ...mapState([ 'value' ]),
    },

    methods: {
      ...mapMutations([ 'updateValue' ]),
    },
  }
</script>
