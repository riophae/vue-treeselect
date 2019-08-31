<template>
  <table class="striped">
    <thead>
      <tr>
        <th class="name">Name</th>
        <th>Props</th>
        <th class="desc">Description</th>
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
  import { link, makePropList } from './utils'

  export default {
    data: () => ({
      slots: [ {
        name: 'option-label',
        props: makePropList([ 'node', 'shouldShowCount', 'count', 'labelClassName', 'countClassName' ]),
        description: `Slot for custom option label template. See ${link('#customize-option-label')} for detailed information.`,
      }, {
        name: 'value-label',
        props: makePropList([ 'node' ]),
        description: `Slot for custom value label template. See ${link('#customize-value-label')} for detailed information.`,
      }, {
        name: 'before-list',
        props: '-',
        description: `Slot showed before the menu list.`,
      }, {
        name: 'after-list',
        props: '-',
        description: `Slot showed after the menu list.`,
      } ],
    }),
  }
</script>
