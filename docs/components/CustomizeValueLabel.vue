<template>
  <div>
    <treeselect
      :options="options"
      :value="value"
      :multiple="multiple"
      >
      <div slot="value-label" slot-scope="{ node }">{{ node.raw.customLabel }}</div>
    </treeselect>
    <p>
      <label><input type="checkbox" v-model="multiple">Multi-select</label>
    </p>
  </div>
</template>

<script>
  export default {
    data: () => ({
      multiple: true,
      value: null,
      options: [ {
                   id: '1',
                   label: 'label1',
                   customLabel: 'custom label1',
                 },
                 {
                   id: '2',
                   label: 'label2',
                   customLabel: 'custom label2',
                 },
                 {
                   id: '3',
                   label: 'label3',
                   customLabel: 'custom label3',
      } ],
    }),
  }
</script>
