<template>
  <div>
    <treeselect
      :multiple="multiple"
      :clearable="clearable"
      :searchable="searchable"
      :disabled="disabled"
      :options="options"
      :limit="3"
      :max-height="200"
      v-model="value"
    />
    <pre class="result">{{ value }}</pre>
    <p>
      <label><input type="checkbox" v-model="multiple">Multi-select</label>
      <label><input type="checkbox" v-model="clearable">Clearable</label>
      <label><input type="checkbox" v-model="searchable">Searchable</label>
      <label><input type="checkbox" v-model="disabled">Disabled</label>
    </p>
  </div>
</template>

<script>
  import { generateOptions } from './utils'

  export default {
    data: () => ({
      multiple: true,
      clearable: true,
      searchable: true,
      disabled: false,
      value: [ 'a' ],
      options: generateOptions(2),
    }),

    watch: {
      multiple(newValue) {
        if (newValue) {
          this.value = this.value ? [ this.value ] : []
        } else {
          this.value = this.value[0]
        }
      },
    },
  }
</script>
