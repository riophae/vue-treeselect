import { mount } from '@vue/test-utils'
import Treeselect from '@riophae/vue-treeselect/components/Treeselect'

describe('Methods', () => {
  describe('toggleExpanded()', () => {
    it('basic', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
            } ],
          } ],
        },
      })
      const { vm } = wrapper
      const { a } = vm.nodeMap

      expect(a.isExpanded).toBe(false)
      wrapper.vm.toggleExpanded(a)
      expect(a.isExpanded).toBe(true)
    })
  })

  it('focusInput() & blurInput()', () => {
    const wrapper = mount(Treeselect, {
      attachToDocument: true,
      propsData: {
        options: [],
        disabled: false,
        searchable: true,
        autoFocus: false,
      },
    })
    const { vm } = wrapper

    expect(vm.isFocused).toBe(false)
    wrapper.vm.focusInput()
    expect(vm.isFocused).toBe(true)
    wrapper.vm.blurInput()
    expect(vm.isFocused).toBe(false)
  })

  describe('openMenu()', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          options: [],
        },
      })
      expect(wrapper.vm.isOpen).toBe(false)
    })

    it('should activate the menu', () => {
      wrapper.vm.openMenu()
      expect(wrapper.vm.isOpen).toBe(true)
    })

    it('should ignore when disabled=true', () => {
      wrapper.setProps({ disabled: true })
      wrapper.vm.openMenu()
      expect(wrapper.vm.isOpen).toBe(false)
    })
  })

  describe('closeMenu()', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          options: [],
        },
        data: {
          isOpen: true,
        },
      })
    })

    it('should close the menu', () => {
      wrapper.vm.closeMenu()
      expect(wrapper.vm.isOpen).toBe(false)
    })
  })

  describe('getNode()', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
          } ],
        },
      })
    })

    it('should be able to obtain normalized node by id', () => {
      expect(wrapper.vm.getNode('a')).toEqual(jasmine.objectContaining({
        id: 'a',
        label: 'a',
      }))
    })

    it('should warn about invalid node id', () => {
      spyOn(console, 'error')
      wrapper.vm.getNode(null)
      expect(console.error).toHaveBeenCalledWith(
        '[Vue-Treeselect Warning]',
        'Invalid node id: null'
      )
    })
  })
})
