import { mount } from '@vue/test-utils'
import Treeselect from '@riophae/vue-treeselect/components/Treeselect'
import {
  typeSearchText,
  pressBackspaceKey,
  pressDeleteKey,
  pressEscapeKey,
  pressAKey,
} from './shared'

describe('Keyboard Support', () => {
  describe('backspace key', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
          }, {
            id: 'b',
            label: 'b',
          } ],
          multiple: true,
          backspaceRemoves: true,
          value: [ 'a', 'b' ],
        },
      })

      expect(wrapper.vm.searchQuery).toBe('')
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a', 'b' ])
    })

    it('should remove the last value if search input is empty', () => {
      pressBackspaceKey(wrapper)
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a' ])
      pressBackspaceKey(wrapper)
      expect(wrapper.vm.selectedNodeIds).toEqual([])
    })

    it('should do nothing if search input has value', async () => {
      await typeSearchText(wrapper, 'test')
      expect(wrapper.vm.searchQuery).toBe('test')
      pressBackspaceKey(wrapper)
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a', 'b' ])
    })

    it('should do nothing when backspaceRemoves=false', () => {
      wrapper.setProps({ backspaceRemoves: false })
      pressBackspaceKey(wrapper)
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a', 'b' ])
    })
  })

  describe('delete key', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
          }, {
            id: 'b',
            label: 'b',
          } ],
          multiple: true,
          deleteRemoves: true,
          value: [ 'a', 'b' ],
        },
      })

      expect(wrapper.vm.searchQuery).toBe('')
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a', 'b' ])
    })

    it('should remove the last value if search input is empty', () => {
      pressDeleteKey(wrapper)
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a' ])
      pressDeleteKey(wrapper)
      expect(wrapper.vm.selectedNodeIds).toEqual([])
    })

    it('should do nothing if search input has value', async () => {
      await typeSearchText(wrapper, 'test')
      expect(wrapper.vm.searchQuery).toBe('test')
      pressDeleteKey(wrapper)
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a', 'b' ])
    })

    it('should do nothing when backspaceRemoves=false', () => {
      wrapper.setProps({ deleteRemoves: false })
      pressDeleteKey(wrapper)
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a', 'b' ])
    })
  })

  describe('escape key', () => {
    let wrapper, vm

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
          }, {
            id: 'b',
            label: 'b',
          } ],
          multiple: true,
          escapeClearsValue: true,
          value: [ 'a', 'b' ],
        },
      })
      vm = wrapper.vm
    })

    it('should reset search query if input has value', async () => {
      await typeSearchText(wrapper, 'test')
      pressEscapeKey(wrapper)
      expect(vm.searchQuery).toBe('')
      expect(vm.selectedNodeIds).toEqual([ 'a', 'b' ])
    })

    it('should close the menu if input is empty', () => {
      wrapper.vm.openMenu()
      expect(vm.searchQuery).toBe('')
      expect(vm.selectedNodeIds).toEqual([ 'a', 'b' ])

      pressEscapeKey(wrapper)
      expect(vm.searchQuery).toBe('')
      expect(vm.selectedNodeIds).toEqual([ 'a', 'b' ])
      expect(vm.isOpen).toBe(false)
    })

    it('should reset value if menu is closed', () => {
      expect(vm.searchQuery).toBe('')
      expect(vm.selectedNodeIds).toEqual([ 'a', 'b' ])
      expect(vm.isOpen).toBe(false)

      pressEscapeKey(wrapper)
      expect(vm.searchQuery).toBe('')
      expect(vm.selectedNodeIds).toEqual([])
      expect(vm.isOpen).toBe(false)
    })

    it('should not reset value when escapeClearsValue=false', () => {
      wrapper.setProps({ escapeClearsValue: false })
      pressEscapeKey(wrapper)
      expect(vm.searchQuery).toBe('')
      expect(vm.selectedNodeIds).toEqual([ 'a', 'b' ])
      expect(vm.isOpen).toBe(false)
    })
  })

  it('should ignore any key press combined with modifier key', () => {
    [ 'ctrlKey', 'shiftKey', 'metaKey', 'altKey' ].forEach(modifierKey => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
          } ],
          multiple: true,
          escapeClearsValue: true,
          value: [ 'a' ],
        },
      })

      pressEscapeKey(wrapper, modifierKey)
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a' ])
    })
  })

  it('any other key press should activate menu', () => {
    const wrapper = mount(Treeselect, {
      propsData: {
        options: [],
      },
    })

    expect(wrapper.vm.isOpen).toBe(false)
    pressAKey(wrapper)
    expect(wrapper.vm.isOpen).toBe(true)
  })
})
