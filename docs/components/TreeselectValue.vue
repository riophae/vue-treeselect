<template>
  <pre class="result">{{ stringifiedValue }}</pre>
</template>

<script>
  export default {
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
  }
</script>
