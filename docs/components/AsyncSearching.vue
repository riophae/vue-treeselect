<template>
  <treeselect
    :multiple="true"
    :async="true"
    :load-options="loadOptions"
    />
</template>

<script>
  import { ASYNC_SEARCH } from '@riophae/vue-treeselect'

  const simulateAsyncOperation = fn => {
    setTimeout(fn, 2000)
  }

  export default {
    methods: {
      loadOptions({ action, searchQuery, callback }) {
        if (action === ASYNC_SEARCH) {
          simulateAsyncOperation(() => {
            const options = [ 1, 2, 3, 4, 5 ].map(i => ({
              id: `${searchQuery}-${i}`,
              label: `${searchQuery}-${i}`,
            }))
            callback(null, options)
          })
        }
      },
    },
  }
</script>
