<template>
  <treeselect
    :load-options="loadOptions"
    :options="options"
    :auto-load-root-options="false"
    :multiple="true"
    placeholder="Open the menu..."
    />
</template>

<script>
  import { LOAD_ROOT_OPTIONS } from '@riophae/vue-treeselect'

  const sleep = d => new Promise(r => setTimeout(r, d))
  let called = false

  export default {
    data: () => ({
      options: null,
    }),

    methods: {
      // You can either use callback or return a Promise.
      async loadOptions({ action/*, callback*/ }) {
        if (action === LOAD_ROOT_OPTIONS) {
          if (!called) {
            // First try: simulate an exception.
            await sleep(2000) // Simulate an async operation.
            called = true
            throw new Error('Failed to load options: test.')
          } else {
            // Second try: simulate a successful loading.
            await sleep(2000)
            this.options = [ 'a', 'b', 'c', 'd', 'e' ].map(id => ({
              id,
              label: `option-${id}`,
            }))
          }
        }
      },
    },
  }
</script>
