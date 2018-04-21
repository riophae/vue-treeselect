import { mount } from '@vue/test-utils'
import Treeselect from '@riophae/vue-treeselect/components/Treeselect'
import { findInput } from './shared'

describe('Search Input', () => {
  it('should disable auto complete', () => {
    const wrapper = mount(Treeselect, {
      propsData: {
        options: [],
      },
    })
    const input = findInput(wrapper)
    expect(input.element.getAttribute('autocomplete')).toBe('off')
  })

  it('should be unable to focus when disabled=true', () => {
    const wrapper = mount(Treeselect, {
      propsData: {
        options: [],
        autoFocus: false,
        searchable: true,
        disabled: true,
      },
    })

    expect(wrapper.vm.isFocused).toBe(false)
    wrapper.vm.focusInput()
    expect(wrapper.vm.isFocused).toBe(false)
  })
})
