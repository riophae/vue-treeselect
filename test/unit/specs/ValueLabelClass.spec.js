import { mount } from '@vue/test-utils'
import { findMultiValueItemByNodeId } from './shared'
import Treeselect from '@src/components/Treeselect'

// Currently @vue/test-utils doesn't properly handle scoped slots.

describe('Value-label style', () => {
  it('should be customizable', async () => {
    const getLabelText = () => findMultiValueItemByNodeId(wrapper).element
    const wrapper = mount(Treeselect, {
      propsData: {
        options: [
          {
            id: 'a',
            label: 'a',
            customClass: 'custom-class-for-a',
            children: [
              {
                id: 'aa',
                label: 'aa',
                customClass: 'aa',
              },
            ],
          },
          {
            id: 'b',
            label: 'b',
            customClass: 'b',
          },
        ],
        defaultExpandLevel: Infinity,
        multiple: true,
      },
    })
    const { vm } = wrapper

    vm.openMenu()
    await vm.$nextTick()

    wrapper.setProps({ multiple: true })
    wrapper.setProps({ value: [ 'a', 'b' ] })
    expect(getLabelText('a')).toHaveClass('custom-class-for-a')
  })
})
