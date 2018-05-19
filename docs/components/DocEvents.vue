<template>
  <table class="striped">
    <thead>
      <tr>
        <th class="name">Name</th>
        <th>Attributes</th>
        <th class="desc">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="event in events" :key="event.name">
        <td><strong>{{ event.name }}</strong></td>
        <td v-html="event.attributes" />
        <td>{{ event.description }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
  import { makeArgNameList } from './utils'

  export default {
    data: () => ({
      events: [ {
        name: 'open',
        attributes: makeArgNameList([ 'instanceId' ]),
        description: 'Emitted when the menu opens.',
      }, {
        name: 'close',
        attributes: makeArgNameList([ 'value', 'instanceId' ]),
        description: 'Emitted when the menu closes.',
      }, {
        name: 'input',
        attributes: makeArgNameList([ 'value', 'instanceId' ]),
        description: 'Emitted after value changes.',
      }, {
        name: 'select',
        attributes: makeArgNameList([ 'node', 'instanceId' ]),
        description: 'Emitted after selecting an option.',
      }, {
        name: 'deselect',
        attributes: makeArgNameList([ 'node', 'instanceId' ]),
        description: 'Emitted after deselecting an option.',
      }, {
        name: 'search-change',
        attributes: makeArgNameList([ 'searchQuery', 'instanceId' ]),
        description: 'Emitted after the search query changes.',
      } ],
    }),
  }
</script>
