<template>
  <div>
    <treeselect
      :multiple="true"
      :options="options"
      placeholder="Search nested..."
      v-model="value"
      searchNested
      />
    <pre class="result">{{ value }}</pre>
  </div>
</template>

<script>
  export default {
    data: () => ({
      value: [],
      options: [ {
        id: 'restaurant1',
        label: 'McDonalds',
        children: [ {
          id: 'apple1',
          label: 'Apple 🍎',
        }, {
          id: 'grapes1',
          label: 'Grapes 🍇',
        }, {
          id: 'pear1',
          label: 'Pear 🍐',
        }, {
          id: 'strawberry1',
          label: 'Strawberry 🍓',
        }, {
          id: 'watermelon1',
          label: 'Watermelon 🍉',
        } ],
      }, {
        id: 'restaurant2',
        label: 'Pizza Hut',
        children: [ {
          id: 'apple2',
          label: 'Apple 🍎',
        }, {
          id: 'grapes2',
          label: 'Grapes 🍇',
        }, {
          id: 'pear2',
          label: 'Pear 🍐',
        }, {
          id: 'strawberry2',
          label: 'Strawberry 🍓',
        }, {
          id: 'watermelon2',
          label: 'Watermelon 🍉',
        } ],
      }, {
        id: 'restaurant3',
        label: 'Burger King',
        children: [ {
          id: 'apple3',
          label: 'Apple 🍎',
        }, {
          id: 'grapes3',
          label: 'Grapes 🍇',
        }, {
          id: 'pear3',
          label: 'Pear 🍐',
        }, {
          id: 'strawberry3',
          label: 'Strawberry 🍓',
        }, {
          id: 'watermelon3',
          label: 'Watermelon 🍉',
        } ],
      } ],
    }),
  }
</script>
