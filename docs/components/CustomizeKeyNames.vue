<template>
  <treeselect
    :options="options"
    :value="value"
    :normalizer="normalizer"
    />
</template>

<script>
  export default {
    data: () => ({
      value: null,
      options: [ {
        key: 'a',
        name: 'a',
        subOptions: [ {
          key: 'aa',
          name: 'aa',
        } ],
      } ],
      normalizer(node/*, id */) {
        // there is an extra `id` argument,
        // which could be useful if you have multiple instances
        // of vue-treeselect that share the same `normalizer` function
        return {
          id: node.key,
          label: node.name,
          children: node.subOptions,
        }
      },
    }),
  }
</script>
