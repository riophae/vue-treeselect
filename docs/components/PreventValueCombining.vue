<template>
  <div>
    <treeselect
      :multiple="true"
      :options="options"
      :default-expand-level="2"
      :value-consists-of="valueConsistsOf"
      v-model="value"
      />
    <treeselect-value :value="value" />
    <p><strong>Value consists of:</strong></p>
    <p class="options">
      <label><input type="radio" value="ALL" v-model="valueConsistsOf">All</label><br>
      <label><input type="radio" value="BRANCH_PRIORITY" v-model="valueConsistsOf">Branch priority</label><br>
      <label><input type="radio" value="LEAF_PRIORITY" v-model="valueConsistsOf">Leaf priority</label><br>
      <label><input type="radio" value="ALL_WITH_INDETERMINATE" v-model="valueConsistsOf">All with indeterminate</label>
    </p>
  </div>
</template>

<script>
  export default {
    data: () => ({
      value: [ 'person-a', 'team-ii' ],
      valueConsistsOf: 'BRANCH_PRIORITY',
    }),
    computed: {
      options() {
        const options = [ {
          id: 'company',
          label: 'Company 🏢',
          children: [ {
            id: 'team-i',
            label: 'Team I 👥',
            children: [ {
              id: 'person-a',
              label: 'Person A 👱',
            } ],
          }, {
            id: 'team-ii',
            label: 'Team II 👥',
            children: [ {
              id: 'person-c',
              label: 'Person C 👳',
            }, {
              id: 'person-d',
              label: 'Person D 👧',
            } ],
          }, {
            id: 'person-e',
            label: 'Person E 👩',
          } ],
        }, {
          id: 'costumer',
          label: 'Costumer 🏢',
          children: [ {
            id: 'client-i',
            label: 'Client I 👥',
            children: [ {
              id: 'userR-a',
              label: 'user A 👱',
            } ],
          } ],
        } ]
        return this.value.length
          ? options.filter(x => x.children)
          : options
      },
    },
  }
</script>
