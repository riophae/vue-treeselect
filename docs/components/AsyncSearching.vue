<template>
  <treeselect
    :multiple="true"
    :async="true"
    :load-options="loadOptions"
    />
</template>

<script>
  import { ASYNC_SEARCH, LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect'

  const simulateAsyncOperation = fn => {
    setTimeout(fn, 2000)
  }

  export default {
    methods: {
      loadOptions({ action, searchQuery, parentNode, callback }) {
        if (action === ASYNC_SEARCH) {
          simulateAsyncOperation(() => {
            const options = [ 1, 2, 3, 4, 5 ].map(i => ({
              id: `${searchQuery}-${i}`,
              label: `${searchQuery}-${i}`,
              children: null,
            }))
            callback(null, options)
          })
        } else if (action === LOAD_CHILDREN_OPTIONS) {
          simulateAsyncOperation(() => {
            parentNode.children = [ {
              id: `${parentNode.id}-child`,
              label: `${parentNode.label} child`,
            } ]
            callback()
          })
        }
      },
    },
  }
</script>
