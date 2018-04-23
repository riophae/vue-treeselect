<template>
  <treeselect
    :multiple="true"
    :options="options"
    :load-options="loadOptions"
    placeholder="Try expanding any folder option..."
    v-model="value"
    />
</template>

<script>
  import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect'

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
      loadOptions({ action, parentNode, callback/*, id */ }) {
        // Typically, do the AJAX stuff here.
        // Once the server has responded,
        // assign children options to the parent node & call the callback.
        // We just use `setTimeout()` here to simulate an async operation
        // instead of requesting a real API server for demo purpose.

        if (action === LOAD_CHILDREN_OPTIONS) {
          switch (parentNode.id) {
          case 'success': {
            setTimeout(() => {
              parentNode.children = [ {
                id: 'child',
                label: 'Child option',
              } ]
              callback()
            }, 2000)
            break
          }
          case 'no-children': {
            setTimeout(() => {
              parentNode.children = []
              callback()
            }, 2000)
            break
          }
          case 'failure': {
            setTimeout(() => {
              callback(new Error('Failed to load options: network error.'))
            }, 2000)
            break
          }
          default: /* empty */
          }
        }
      },
    },
  }
</script>
