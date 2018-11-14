<template>
  <div>
    <form action="" id="another-form"></form>
    <treeselect
      :options="options"
      :value="value"
      name="another-form-field"
      form="another-form"
      :searchable="false"
      @input="updateValue"
      />
    <pre class="result">{{ value }}</pre>
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
