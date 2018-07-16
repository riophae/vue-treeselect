<script>
  import Input from './Input'
  import Placeholder from './Placeholder'

  export default {
    name: 'vue-treeselect--single-value',
    inject: [ 'instance' ],

    render() {
      const { instance } = this
      const shouldShowValue = instance.hasValue && !instance.trigger.searchQuery
      const { renderValueContainer } = this.$parent

      return renderValueContainer([
        shouldShowValue && (
          <div class="vue-treeselect__single-value">
            { instance.selectedNodes[0].label }
          </div>
        ),
        <Placeholder />,
        <Input ref="input" />,
      ])
    },
  }
</script>
