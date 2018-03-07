<template>
  <table class="striped">
    <thead>
      <tr>
        <th>Name</th>
        <th>Props</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="slot in slots" :key="slot.name">
        <td><strong>{{ slot.name }}</strong></td>
        <td v-html="slot.props"></td>
        <td>{{ slot.description }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
  const v = text => `<code>${text}</code>`

  export default {
    data: () => ({
      slots: [ {
        name: 'option-label',
        props: [ 'node', 'shouldShowCount', 'count', 'labelClassName', 'countClassName' ].map(v).join(', '),
        description: 'Slot for custom option label template.',
      } ],
    }),
  }
</script>
