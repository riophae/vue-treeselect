<template>
  <treeselect
    :multiple="true"
    :options="options"
    :show-count="true"
    :allways-opened="true"
    placeholder="Select your favourite(s)..."
  />
</template>

<script>
  export default {
    data: () => ({
      options: [ {
        id: 'fruits',
        label: 'Fruits',
        children: [ {
          id: 'apple',
          label: 'Apple 🍎',
        }, {
          id: 'appletwo',
          label: 'Apple Two 📺',
          disabled: true,
        }, {
          id: 'grapes',
          label: 'Grapes 🍇',
        }, {
          id: 'pear',
          label: 'Pear 🍐',
        }, {
          id: 'strawberry',
          label: 'Strawberry 🍓',
        }, {
          id: 'watermelon',
          label: 'Watermelon 🍉',
        } ],
      }, {
        id: 'vegetables',
        label: 'Vegetables',
        children: [ {
          id: 'corn',
          label: 'Corn 🌽',
        }, {
          id: 'carrot',
          label: 'Carrot 🥕',
        }, {
          id: 'eggplant',
          label: 'Eggplant 🍆',
        }, {
          id: 'tomato',
          label: 'Tomato 🍅',
        } ],
      } ],
    }),
  }
</script>
