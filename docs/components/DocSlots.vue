<template>
  <table class="striped">
    <thead>
      <tr>
        <th style="width: 6em">Name</th>
        <th style="width: 250px">Props</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="slot in slots" :key="slot.name">
        <td><strong>{{ slot.name }}</strong></td>
        <td v-html="slot.props" />
        <td v-html="slot.description" />
      </tr>
    </tbody>
  </table>
</template>

<script>
  const v = code => `<code>${code}</code>`
  const link = (target, text = 'here') => `<a href="${target}">${text}</a>`

  export default {
    data: () => ({
      slots: [ {
        name: 'option-label',
        props: [ 'node', 'shouldShowCount', 'count', 'labelClassName', 'countClassName' ].map(v).join(', '),
        description: `Slot for custom option label template. See ${link('#customize-option-label')} for detailed information.`,
      } ],
    }),
  }
</script>
