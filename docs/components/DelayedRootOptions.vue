<template>
  <treeselect
    :load-root-options="loadRootOptions"
    :auto-load-root-options="false"
    />
</template>

<script>
  let called = false

  export default {
    methods: {
      loadRootOptions(callback) {
        if (called) {
          const rootOptions = [ {
            id: 'a',
            label: 'a',
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
