<template>
  <treeselect
    :load-root-options="loadRootOptions"
    :auto-load-root-options="false"
    :multiple="true"
    />
</template>

<script>
  let called = false

  export default {
    methods: {
      loadRootOptions(callback/*, id */) {
        // If you have multiple instances of vue-treeselect that
        // shares the same `loadRootOptions` function,
        // you can use the `id` argument (which is the `id` prop you passed)
        // to identify the origin.
        if (called) {
          const rootOptions = [ {
            id: 'a',
            label: 'a',
            children: [],
          }, {
            id: 'b',
            label: 'b',
          } ]
          setTimeout(() => callback(null, rootOptions), 2000)
        } else {
          called = true
          setTimeout(() => callback(new Error('test')), 2000)
        }
      },
    },
  }
</script>
