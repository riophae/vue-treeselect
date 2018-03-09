<template>
  <treeselect
    :multiple="true"
    :options="options"
    :show-count="true"
    :value="value"
    placeholder="Select your favourite(s)..."
  />
</template>

<script>
  export default {
    data: () => ({
      options: [ {
        id: 'folder',
        label: 'Normal Folder',
        children: [ {
          id: 'disabled-checked',
          label: 'Checked',
          disabled: true,
        }, {
          id: 'disabled-unchecked',
          label: 'Unchecked',
          disabled: true,
        }, {
          id: 'normal-1',
          label: 'Normal',
        } ],
      }, {
        id: 'disabled-folder',
        label: 'Disabled Folder',
        disabled: true,
        children: [ {
          id: 'normal-2',
          label: 'Item',
        }, {
          id: 'normal-3',
          label: 'Item',
        } ],
      } ],
      value: [ 'disabled-checked' ],
    }),
  }
</script>
