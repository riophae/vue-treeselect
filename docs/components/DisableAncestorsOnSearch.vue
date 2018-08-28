<template>
  <treeselect
    :options="options"
    :disable-ancestors-on-search="true"
    :multiple="true"
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
