<template>
  <treeselect
    :options="options"
    :disable-branch-nodes="true"
    :show-count="true"
    placeholder="Where are you from?"
    />
</template>

<script>
  import countries from './data/countries-of-the-world'

  export default {
    data: () => ({
      options: countries,
    }),
  }
</script>
