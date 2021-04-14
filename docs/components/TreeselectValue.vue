<template>
  <pre class="result">{{ stringifiedValue }}</pre>
</template>

<script>
  import { h, defineComponent } from 'vue'

  export default defineComponent({
    // eslint-disable-next-line vue/require-prop-types
    props: [ 'value' ],

    computed: {
      stringifiedValue() {
        const rawValue = this.value

        return rawValue === undefined
          ? 'undefined'
          : JSON.stringify(rawValue, null, 2)
      },
    },
  },
  )
</script>
