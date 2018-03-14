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
        switch (parent.id) {
        case 'success': {
          const children = [ {
            id: 'child',
            label: 'Child option',
          } ]
          setTimeout(() => callback(null, children), 2000)
          break
        }
        case 'no-children': {
          setTimeout(() => callback(null, []), 2000)
          break
        }
        case 'failure': {
          setTimeout(() => callback(new Error('Network error')), 2000)
          break
        }
        default: /* Empty */
        }
      },
    },
  }
</script>
