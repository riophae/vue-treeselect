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

  let called = false

  export default {
    data: () => ({
      options: null,
    }),
    methods: {
      loadOptions({ action, callback/*, id */ }) {
        // If you have multiple instances of vue-treeselect that
        // shares the same `loadRootOptions` function,
        // you can use the `id` argument (which is the `id` prop you passed)
        // to identify the origin.

        if (action === LOAD_ROOT_OPTIONS) {
          if (called) {
            setTimeout(() => {
              this.options = [ 'a', 'b', 'c', 'd', 'e' ].map(id => ({
                id,
                label: `option-${id}`,
              }))
              callback()
            }, 2000)
          } else {
            called = true
            setTimeout(() => {
              callback(new Error('Failed to load options: test.'))
            }, 2000)
          }
        }
      },
    },
  }
</script>
