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
      normalizer(node) {
        return {
          id: node.key,
          label: node.name,
          children: node.subOptions,
        }
      },
    }),
  }
</script>
