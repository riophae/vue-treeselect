import { mount } from '@vue/test-utils'
import {
  generateOptions,
  leftClick, typeSearchText,
  findMenu, findOptionByNodeId,
} from './shared'
import Treeselect from '@src/components/Treeselect'
import Input from '@src/components/Input'

describe('Menu', () => {
  it('should blur the input & close the menu after clicking anywhere outside the component', async () => {
    const wrapper = mount(Treeselect, {
      sync: false,
      attachToDocument: true,
      propsData: {
        options: [],
      },
    })
    const { vm } = wrapper

    vm.openMenu()
    await vm.$nextTick()

    const event = document.createEvent('event')
    event.initEvent('mousedown', true, true)
    document.body.dispatchEvent(event)
    expect(vm.trigger.isFocused).toBe(false)
    expect(vm.menu.isOpen).toBe(false)
  })

  it('should open the menu after clicking the control when focused', () => {
    const wrapper = mount(Treeselect, {
      attachToDocument: true,
      propsData: {
        options: [],
      },
    })
    wrapper.vm.trigger.isFocused = true
    const valueContainer = wrapper.find('.vue-treeselect__value-container')

    leftClick(valueContainer)
    expect(wrapper.vm.menu.isOpen).toBe(true)
  })

  it('click on option arrow should toggle expanded', async () => {
    const wrapper = mount(Treeselect, {
      sync: false,
      attachToDocument: true,
      propsData: {
        options: [ {
          id: 'a',
          label: 'a',
          children: [],
        } ],
      },
    })
    const { vm } = wrapper
    const { a } = vm.forest.nodeMap

    vm.openMenu()
    await vm.$nextTick()

    expect(a.isExpanded).toBe(false)
    const optionArrow = findOptionByNodeId(wrapper, 'a').find('.vue-treeselect__option-arrow-container')
    leftClick(optionArrow)
    expect(a.isExpanded).toBe(true)
    leftClick(optionArrow)
    expect(a.isExpanded).toBe(false)
  })

  it('should highlight the option when the cursor hovering over it', async () => {
    const wrapper = mount(Treeselect, {
      propsData: {
        options: [ {
          id: 'a',
          label: 'a',
        }, {
          id: 'b',
          label: 'b',
        } ],
      },
    })
    const { vm } = wrapper

    vm.openMenu()
    await vm.$nextTick()

    expect(vm.menu.current).toBe('a')
    expect(vm.forest.nodeMap.a.isHighlighted).toBe(true)

    findOptionByNodeId(wrapper, 'b').trigger('mouseenter')
    expect(vm.menu.current).toBe('b')
    expect(vm.forest.nodeMap.b.isHighlighted).toBe(true)

    findOptionByNodeId(wrapper, 'a').trigger('mouseenter')
    expect(vm.menu.current).toBe('a')
    expect(vm.forest.nodeMap.a.isHighlighted).toBe(true)
  })

  it('retain scroll position on menu reopen', async () => {
    const maxHeight = 100
    const wrapper = mount(Treeselect, {
      propsData: {
        options: generateOptions(3),
        defaultExpandLevel: Infinity,
        maxHeight,
      },
      attachToDocument: true,
    })
    const { vm } = wrapper

    let i = 3
    let pos = 0
    const step = 20
    while (i--) {
      vm.openMenu()
      await vm.$nextTick()
      const menu = findMenu(wrapper)
      expect(menu.element.scrollHeight).toBeGreaterThan(maxHeight)
      expect(menu.element.scrollTop).toBe(pos)
      pos += step
      menu.element.scrollBy(0, step)
      vm.closeMenu()
      await vm.$nextTick()
    }
  })

  it('should reset the search box after closing menu', async () => {
    const wrapper = mount(Treeselect, {
      sync: false,
      propsData: {
        options: [],
      },
    })
    const { vm } = wrapper
    const input = wrapper.find(Input)

    const assertInputValue = expected => {
      expect(vm.trigger.searchQuery).toBe(expected)
      expect(input.vm.value).toBe(expected)
      expect(input.find('input[type="text"]').element.value).toBe(expected)
    }

    vm.openMenu()
    await vm.$nextTick()

    await typeSearchText(wrapper, 'a')
    assertInputValue('a')

    vm.closeMenu()
    await vm.$nextTick()
    assertInputValue('')
  })

  it('set appendToBody to true when alwaysOpen=true should not throw error', () => {
    const wrapper = mount(Treeselect, {
      attachToDocument: true,
      propsData: {
        options: [],
        alwaysOpen: true,
      },
    })

    wrapper.setProps({ appendToBody: true })
  })
})
