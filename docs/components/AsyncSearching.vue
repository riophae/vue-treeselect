<template>
  <treeselect
    :multiple="true"
    :async="true"
    :load-options="loadOptions"
    />
</template>

<script>
  import { ASYNC_SEARCH } from '@riophae/vue-treeselect'

  export default {
    methods: {
      loadOptions({ action, searchQuery, callback }) {
        if (action === ASYNC_SEARCH) {
          setTimeout(() => {
            const options = [ 1, 2, 3, 4, 5 ].map(i => ({
              id: `${searchQuery}-${i}`,
              label: `${searchQuery}-${i}`,
            }))
            callback(null, options)
          }, 2000)
        }
      },
    },
  }
</script>
