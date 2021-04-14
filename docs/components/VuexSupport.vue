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
  import { defineComponent } from 'vue'

  import { createStore, mapState, mapMutations } from 'vuex'
  import { generateOptions } from './utils'

  // Vue.use(Vuex)

  const store = createStore({
    state: {
      value: 'a',
    },
    mutations: {
      updateValue(state, value) {
        state.value = value
      },
    },
  })

  export default defineComponent({
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
  },
  )
</script>
