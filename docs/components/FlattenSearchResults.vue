<template>
  <treeselect
    :options="options"
    :multiple="true"
    :flatten-search-results="true"
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
