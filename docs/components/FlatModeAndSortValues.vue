<template>
  <div>
    <treeselect
      :multiple="true"
      :options="options"
      :flat="true"
      :sort-value-by="sortValueBy"
      :default-expand-level="1"
      placeholder="Try selecting some options."
      v-model="value"
      />
    <treeselect-value :value="value" />
    <p><strong>Sort value by:</strong></p>
    <p class="options">
      <label><input type="radio" value="ORDER_SELECTED" v-model="sortValueBy">Order selected</label>
      <label><input type="radio" value="LEVEL" v-model="sortValueBy">Level</label>
      <label><input type="radio" value="INDEX" v-model="sortValueBy">Index</label>
    </p>
  </div>
</template>

<script>
  import { generateOptions } from './utils'

  export default {
    data() {
      return {
        value: [ 'c', 'aaa', 'bb' ],
        options: generateOptions(3),
        sortValueBy: 'ORDER_SELECTED',
      }
    },
  }
</script>
