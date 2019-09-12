<template>
  <div>
    <div :dir="rtl ? 'rtl' : 'ltr'">
      <treeselect
        name="demo"
        :multiple="multiple"
        :clearable="clearable"
        :searchable="searchable"
        :disabled="disabled"
        :open-on-click="openOnClick"
        :open-on-focus="openOnFocus"
        :clear-on-select="clearOnSelect"
        :close-on-select="closeOnSelect"
        :always-open="alwaysOpen"
        :append-to-body="appendToBody"
        :options="options"
        :limit="3"
        :max-height="200"
        v-model="value"
        />
    </div>
    <treeselect-value :value="value" />
    <p>
      <label><input type="checkbox" v-model="multiple">Multi-select</label>
      <label><input type="checkbox" v-model="clearable">Clearable</label>
      <label><input type="checkbox" v-model="searchable">Searchable</label>
      <label><input type="checkbox" v-model="disabled">Disabled</label>
    </p>
    <p>
      <label><input type="checkbox" v-model="openOnClick">Open on click</label>
      <label><input type="checkbox" v-model="openOnFocus">Open on focus</label>
    </p>
    <p>
      <label><input type="checkbox" v-model="clearOnSelect">Clear on select</label>
      <label><input type="checkbox" v-model="closeOnSelect">Close on select</label>
    </p>
    <p>
      <label><input type="checkbox" v-model="alwaysOpen">Always open</label>
      <label><input type="checkbox" v-model="appendToBody">Append to body</label>
      <label><input type="checkbox" v-model="rtl">RTL mode</label>
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
      openOnClick: true,
      openOnFocus: false,
      clearOnSelect: true,
      closeOnSelect: false,
      alwaysOpen: false,
      appendToBody: false,
      rtl: false,
      value: [ 'a' ],
      options: generateOptions(2, 3),
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
