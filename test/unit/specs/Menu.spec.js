import { mount } from '@vue/test-utils'
import Treeselect from '@riophae/vue-treeselect/components/Treeselect'
import { leftClick, findOptionByNodeId } from './shared'

describe('Menu', () => {
  it('should blur the input & close the menu after clicking anywhere outside the component', () => {
    const wrapper = mount(Treeselect, {
      attachToDocument: true,
      propsData: {
        options: [],
      },
    })
    const { vm } = wrapper

    vm.openMenu()
    const event = document.createEvent('event')
    event.initEvent('mousedown', true, true)
    document.body.dispatchEvent(event)
    expect(vm.isFocused).toBe(false)
    expect(vm.isOpen).toBe(false)
  })

  it('should open the menu after clicking the control when focused', () => {
    const wrapper = mount(Treeselect, {
      attachToDocument: true,
      propsData: {
        options: [],
      },
      data: {
        isFocused: true,
      },
    })
    const valueContainer = wrapper.find('.vue-treeselect__value-container')

    leftClick(valueContainer)
    expect(wrapper.vm.isOpen).toBe(true)
  })

  it('should close the menu after clicking inside the value wrapper when isOpen=true && searchable=false', () => {
    const wrapper = mount(Treeselect, {
      attachToDocument: true,
      propsData: {
        options: [ {
          id: 'a',
          label: 'a',
        } ],
        multiple: false,
        searchable: false,
      },
      data: {
        isOpen: true,
        isFocused: true,
      },
    })

    wrapper.vm.openMenu()
    const valueContainer = wrapper.find('.vue-treeselect__value-container')
    leftClick(valueContainer)
    expect(wrapper.vm.isOpen).toBe(false)
  })

  it('should not close the menu after clicking a value remove button when multiple=true && searchable=false', () => {
    const wrapper = mount(Treeselect, {
      attachToDocument: true,
      propsData: {
        multiple: true,
        options: [ {
          id: 'a',
          label: 'a',
        }, {
          id: 'b',
          label: 'b',
        } ],
        value: [ 'a', 'b' ],
      },
      data: {
        isOpen: true,
      },
    })
    const { vm } = wrapper

    const [ firstRemove, secondRemove ] = wrapper.findAll('.vue-treeselect__value-remove').wrappers

    leftClick(firstRemove)
    expect(vm.isOpen).toBe(true)
    expect(vm.selectedNodeIds).toEqual([ 'b' ])

    leftClick(secondRemove)
    expect(vm.isOpen).toBe(true)
    expect(vm.selectedNodeIds).toEqual([])
  })

  it('click on option arrow should toggle expanded', () => {
    const wrapper = mount(Treeselect, {
      attachToDocument: true,
      propsData: {
        options: [ {
          id: 'a',
          label: 'a',
          children: [],
        } ],
      },
      data: {
        isOpen: true,
      },
    })
    const { a } = wrapper.vm.nodeMap

    expect(a.isExpanded).toBe(false)
    const optionArrow = findOptionByNodeId(wrapper, 'a').find('.vue-treeselect__option-arrow-container')
    leftClick(optionArrow)
    expect(a.isExpanded).toBe(true)
    leftClick(optionArrow)
    expect(a.isExpanded).toBe(false)
  })
})
