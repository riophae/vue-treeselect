<script>
  import Input from './Input'
  import Placeholder from './Placeholder'

  export default {
    name: 'vue-treeselect--single-value',
    inject: [ 'instance' ],
    methods: {
      renderSingleValueLabel() {
        const { instance, node } = this;

        const customValueLabelRenderer = instance.$scopedSlots['value-label'];
        return customValueLabelRenderer
          ? customValueLabelRenderer({ node: instance.selectedNodes[0] })
          : instance.selectedNodes[0].label;
      },
	  },
    render() {
      const { instance, $parent: { renderValueContainer } } = this
      const shouldShowValue = instance.hasValue && !instance.trigger.searchQuery

      return renderValueContainer([
        shouldShowValue && (
          <div class="vue-treeselect__single-value">
            { this.renderSingleValueLabel() }
          </div>
        ),
        <Placeholder />,
        <Input ref="input" />,
      ])
    },
  }
</script>
