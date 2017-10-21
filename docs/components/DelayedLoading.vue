<template>
  <treeselect
    :multiple="true"
    :options="options"
    :load-children-options="loadChildrenOptions"
    placeholder="Try expanding any folder option..."
    v-model="value"
  />
</template>

<script>
  export default {
    data: () => ({
      value: null,
      options: [ {
        id: 'success',
        label: 'With children',
        // declare an unloaded branch node
        children: null,
      }, {
        id: 'no-children',
        label: 'With no children',
        // alternative approach
        isBranch: true,
      }, {
        id: 'failure',
        label: 'Demonstrates error handling',
        children: null,
      } ],
    }),

    methods: {
      loadChildrenOptions(parent, callback) {
        // Typically, do the AJAX stuff here.
        // Once the server has responded, call the callback with received data.
        // We just use `setTimeout()` here to simulate an async operation
        // instead of requesting a real API server for demo purpose.
        const delay = fn => setTimeout(fn, 2000)
        switch (parent.id) {
          case 'success':
            delay(() => callback(null, [ {
              id: 'child',
              label: 'Child option',
            } ]))
            break
          case 'no-children':
            delay(() => callback(null, []))
            break
          case 'failure':
            delay(() => callback(new Error('Network error')))
            break
          default: /* Empty */
        }
      },
    },
  }
</script>
