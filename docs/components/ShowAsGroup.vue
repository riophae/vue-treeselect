<template>
  <div>
    <treeselect
      v-model="value"
      :options="selectOptions"
      :show-as-group="true"
      :multiple="multiple"
      />
    <treeselect-value :value="value" />
    <p class="options">
      <label><input type="checkbox" v-model="multiple">Multi-select</label>
    </p>
    <p style="display: flex;flex-direction: column;">
      <label><input type="checkbox" v-model="availableTypes.typeA" @change="clearValue">Show type A</label>
      <label><input type="checkbox" v-model="availableTypes.typeB" @change="clearValue">Show type B</label>
      <label><input type="checkbox" v-model="availableTypes.typeC" @change="clearValue">Show type C</label>
      <label><input type="checkbox" v-model="availableTypes.typeD" @change="clearValue">Show type D</label>
    </p>
  </div>
</template>

<script>

  export default {
    name: 'ConjointlyTest',
    data: () => ({
      value: [],
      multiple: true,
      availableTypes: {
        typeA: true,
        typeB: true,
        typeC: true,
        typeD: true,
      },
      options: [
        { id: '"quotes in ID"', label: 'quotes in ID', type: 'typeA' },
        {
          label: 'Group of type A',
          children: [
            { id: 'value_a1', label: 'Value A1', type: 'typeA' },
          ],
        }, {
          label: 'Group of type B',
          children: [
            { id: 'value_b1', label: 'Value B1', type: 'typeB' },
            { id: 'value_b2', label: 'Value B2', type: 'typeB' },
          ],
        }, {
          label: 'Group of type C',
          children: [
            { id: 'value_c1', label: 'Value C1', type: 'typeC' },
            { id: 'value_c2', label: 'Value C2', type: 'typeC' },
            { id: 'value_c3', label: 'Value C3', type: 'typeC' },
            { id: 'value_c4', label: 'Value C4', type: 'typeC' },
          ],
        }, {
          label: 'Group of type D',
          children: [
            { id: 'value_d1', label: 'Value D1', type: 'typeD' },
            { id: 'value_d2', label: 'Value D2', type: 'typeD' },
            { id: 'value_d3', label: 'Value D3', type: 'typeD' },
            { id: 'value_d4', label: 'Value D4', type: 'typeD' },
            { id: 'value_d5', label: 'Value D5', type: 'typeD' },
            { id: 'value_d6', label: 'Value D6', type: 'typeD' },
          ],
        },
      ],

    }),
    computed: {
      selectOptions() {
        return this.options.filter(element => element.children === undefined || element.children.filter(option => this.availableTypes[option.type]).length > 0)
      },
    },
    watch: {
      multiple(newValue) {
        if (newValue) {
          this.value = this.value ? [ this.value ] : []
        } else {
          this.value = this.value[0]
        }
      },
    },
    methods: {
      clearValue() {
        this.value = this.multiple ? [] : undefined
      },
    },
  }
</script>
