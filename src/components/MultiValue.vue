<script>
  import MultiValueItem from './MultiValueItem'
  import Input from './Input'
  import Placeholder from './Placeholder'

  export default {
    name: 'vue-treeselect--multi-value',
    inject: [ 'instance' ],

    methods: {
      renderMultiValueItems() {
        const { instance } = this

        return instance.internalValue
          .slice(0, instance.limit)
          .map(instance.getNode)
          .map(node => (
            <MultiValueItem key={`multi-value-item-${node.id}`} node={node} />
          ))
      },

      renderExceedLimitTip() {
        const { instance } = this
        const count = instance.internalValue.length - instance.limit

        if (count <= 0) return null

        return (
          <div class="vue-treeselect__limit-tip vue-treeselect-helper-zoom-effect-off" key="exceed-limit-tip">
            <span class="vue-treeselect__limit-tip-text">{ instance.limitText(count) }</span>
          </div>
        )
      },
    },

    render() {
      const { renderValueContainer } = this.$parent
      const transitionGroupProps = {
        props: {
          tag: 'div',
          name: 'vue-treeselect__multi-value-item--transition',
          appear: true,
        },
      }

      return renderValueContainer(
        <transition-group class="vue-treeselect__multi-value" {...transitionGroupProps}>
          {this.renderMultiValueItems()}
          {this.renderExceedLimitTip()}
          <Placeholder key="placeholder" />
          <Input ref="input" key="input" />
        </transition-group>
      )
    },
  }
</script>
