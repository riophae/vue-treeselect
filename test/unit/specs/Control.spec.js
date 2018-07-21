import { mount } from '@vue/test-utils'
import Treeselect from '@src/components/Treeselect'
import { leftClick } from './shared'

describe('Control', () => {
  it('should toggle the menu when the arrow is clicked', () => {
    const wrapper = mount(Treeselect, {
      sync: false,
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
