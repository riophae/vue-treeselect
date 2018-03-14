<template>
  <treeselect
    :multiple="true"
    :options="options"
    :value="value"
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
          isDisabled: true,
        }, {
          id: 'disabled-unchecked',
          label: 'Unchecked',
          isDisabled: true,
        }, {
          id: 'item-1',
          label: 'Item',
        } ],
      }, {
        id: 'disabled-folder',
        label: 'Disabled Folder',
        isDisabled: true,
        children: [ {
          id: 'item-2',
          label: 'Item',
        }, {
          id: 'item-3',
          label: 'Item',
        } ],
      } ],
      value: [ 'disabled-checked' ],
    }),
  }
</script>
