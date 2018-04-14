<template>
  <input type="hidden" :name="instance.name" :value="stringifiedValue" :disabled="instance.disabled">
</template>

<script>
  export default {
    name: 'vue-treeselect--hidden-field',
    inject: [ 'instance' ],

    props: {
      stringifiedValue: {
        type: String,
        required: true,
      },
    },
  }
</script>
