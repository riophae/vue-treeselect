import { mount } from '@vue/test-utils'
import { findInput, typeSearchText } from './shared'
import Treeselect from '@src/components/Treeselect'

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

    expect(wrapper.vm.trigger.isFocused).toBe(false)
    wrapper.vm.focusInput()
    expect(wrapper.vm.trigger.isFocused).toBe(false)
  })

  it('when multiple=true, input should fit the width of user-input text', async () => {
    const wrapper = mount(Treeselect, {
      propsData: {
        options: [],
        multiple: true,
        searchable: true,
      },
      attachToDocument: true,
      sync: false,
    })
    const input = findInput(wrapper)
    const fullText = 'hello world'
    let i = 0
    let prevWidth = input.element.offsetWidth

    expect(prevWidth).toBeGreaterThan(0)

    while (i < fullText.length) {
      await typeSearchText(wrapper, fullText.slice(0, i += 3))
      const width = input.element.offsetWidth
      expect(width).toBeGreaterThan(prevWidth)
      prevWidth = width
    }

    while (i > 0) {
      await typeSearchText(wrapper, fullText.slice(0, i -= 3))
      const width = input.element.offsetWidth
      expect(width).toBeLessThan(prevWidth)
      prevWidth = width
    }
  })
})
