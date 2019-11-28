<template>
  <treeselect :options="options" v-model="value">
    <template slot="arrow-icon" slot-scope="{ isOpen }">
      {{ isOpen ? "O" : "C" }}
    </template>
  </treeselect>
</template>

<script>
  export default {
    data: () => ({
      value: [],
      options: [
        {
          id: 'fruits',
          label: 'Fruits',
          children: [
            {
              id: 'apple',
              label: 'Apple 🍎',
              isNew: true,
            },
            {
              id: 'grapes',
              label: 'Grapes 🍇',
            },
            {
              id: 'pear',
              label: 'Pear 🍐',
            },
            {
              id: 'strawberry',
              label: 'Strawberry 🍓',
            },
            {
              id: 'watermelon',
              label: 'Watermelon 🍉',
            },
          ],
        },
        {
          id: 'vegetables',
          label: 'Vegetables',
          children: [
            {
              id: 'corn',
              label: 'Corn 🌽',
            },
            {
              id: 'carrot',
              label: 'Carrot 🥕',
            },
            {
              id: 'eggplant',
              label: 'Eggplant 🍆',
            },
            {
              id: 'tomato',
              label: 'Tomato 🍅',
            },
          ],
        },
      ],
    }),
  }
</script>
