<template>
  <treeselect
    :options="options"
    :multiple="true"
    :flatten-search-results="true"
    placeholder="Where are you from?"
    />
</template>

<script>
  import { defineComponent } from 'vue'

  import countries from './data/countries-of-the-world'

  export default defineComponent({
    data: () => ({
      options: countries,
    }),
  },
  )
</script>
