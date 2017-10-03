<template>
  <div class="vue-treeselect__placeholder vue-treeselect-helper-zoom-effect-off">
    <slot name="placeholder">{{ instance.placeholder }}</slot>
  </div>
</template>

<script>
  export default {
    name: 'vue-treeselect--placeholder',
    inject: [ 'instance' ],
  }
</script>
