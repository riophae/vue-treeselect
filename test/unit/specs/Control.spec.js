import { mount } from '@vue/test-utils'
import Treeselect from '@riophae/vue-treeselect/components/Treeselect'
import { leftClick } from './shared'

describe('Control', () => {
  it('should toggle the menu when arrow is clicked', () => {
    const wrapper = mount(Treeselect, {
      attachToDocument: true,
      propsData: {
        options: [],
      },
    })
    const arrow = wrapper.find('.vue-treeselect__control-arrow-container')

    leftClick(arrow)
    expect(wrapper.vm.menu.isOpen).toBe(true)
    leftClick(arrow)
    expect(wrapper.vm.menu.isOpen).toBe(false)
  })
})
