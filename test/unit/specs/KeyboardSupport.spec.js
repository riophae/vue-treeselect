import Vue from 'vue'
import { mount } from '@vue/test-utils'
import sleep from 'yaku/lib/sleep'
import {
  typeSearchText,
  pressBackspaceKey,
  pressEnterKey,
  pressEscapeKey,
  pressEndKey,
  pressHomeKey,
  pressArrowLeft,
  pressArrowUp,
  pressArrowRight,
  pressArrowDown,
  pressDeleteKey,
  pressAKey,
} from './shared'
import Treeselect from '@src/components/Treeselect'

describe('Keyboard Support', () => {
  it('(enter + arrows + home + end) keys should trigger opening menu', () => {
    const keyPressors = [
      pressEnterKey,
      pressArrowDown,
      pressArrowUp,
      pressArrowRight,
      pressArrowLeft,
      pressHomeKey,
      pressEndKey,
    ]

    keyPressors.forEach(keyPressor => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
        },
      })
      const { vm } = wrapper

      keyPressor(wrapper)
      expect(vm.menu.isOpen).toBe(true)
    })
  })

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

      expect(wrapper.vm.trigger.searchQuery).toBe('')
      expect(wrapper.vm.forest.selectedNodeIds).toEqual([ 'a', 'b' ])
    })

    it('should remove the last value if search input is empty', () => {
      pressBackspaceKey(wrapper)
      expect(wrapper.vm.forest.selectedNodeIds).toEqual([ 'a' ])
      pressBackspaceKey(wrapper)
      expect(wrapper.vm.forest.selectedNodeIds).toEqual([])
    })

    it('should do nothing if search input has value', async () => {
      await typeSearchText(wrapper, 'test')
      expect(wrapper.vm.trigger.searchQuery).toBe('test')
      pressBackspaceKey(wrapper)
      expect(wrapper.vm.forest.selectedNodeIds).toEqual([ 'a', 'b' ])
    })

    it('should do nothing when backspaceRemoves=false', () => {
      wrapper.setProps({ backspaceRemoves: false })
      pressBackspaceKey(wrapper)
      expect(wrapper.vm.forest.selectedNodeIds).toEqual([ 'a', 'b' ])
    })
  })

  describe('enter key', () => {
    async function createInstance() {
      const wrapper = mount(Treeselect, {
        propsData: {
          alwaysOpen: true,
          options: [ {
            id: 'a',
            label: 'a',
          }, {
            id: 'b',
            label: 'b',
          }, {
            id: 'c',
            label: 'c',
            isDisabled: true,
          }, {
            id: 'd',
            label: 'd',
            children: [],
          } ],
        },
      })
      const { vm } = wrapper

      await vm.$nextTick()

      expect(vm.menu.isOpen).toBe(true)
      expect(vm.menu.current).toBe('a')

      return { wrapper, vm }
    }

    it('select or deselect option using enter key (single-select)', async () => {
      const { wrapper, vm } = await createInstance()

      wrapper.setProps({ multiple: false })

      pressEnterKey(wrapper)
      expect(vm.internalValue).toEqual([ 'a' ])
      pressEnterKey(wrapper)
      expect(vm.internalValue).toEqual([ 'a' ])

      vm.setCurrentHighlightedOption(vm.forest.nodeMap.b)
      expect(vm.menu.current).toBe('b')
      pressEnterKey(wrapper)
      expect(vm.internalValue).toEqual([ 'b' ])
    })

    it('select or deselect option using enter key (multi-select)', async () => {
      const { wrapper, vm } = await createInstance()

      wrapper.setProps({ multiple: true })

      pressEnterKey(wrapper)
      expect(vm.internalValue).toEqual([ 'a' ])
      pressEnterKey(wrapper)
      expect(vm.internalValue).toEqual([])

      vm.setCurrentHighlightedOption(vm.forest.nodeMap.b)
      expect(vm.menu.current).toBe('b')
      pressEnterKey(wrapper)
      expect(vm.internalValue).toEqual([ 'b' ])
    })

    it('pressing enter key on a disabled option should be no-op', async () => {
      const { wrapper, vm } = await createInstance()

      vm.setCurrentHighlightedOption(vm.forest.nodeMap.c)
      expect(vm.menu.current).toBe('c')
      expect(vm.forest.nodeMap.c.isDisabled).toBe(true)
      pressEnterKey(wrapper)
      expect(vm.internalValue).toEqual([])
    })

    it('pressing enter key on a branch node when disabledBranchNodes=true should be no-op', async () => {
      const { wrapper, vm } = await createInstance()

      wrapper.setProps({ disableBranchNodes: true })

      vm.setCurrentHighlightedOption(vm.forest.nodeMap.d)
      expect(vm.menu.current).toBe('d')
      expect(vm.forest.nodeMap.d.isBranch).toBe(true)
      pressEnterKey(wrapper)
      expect(vm.internalValue).toEqual([])
    })

    // #208
    it('pressing enter key when there is no options should be no-op', async () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          alwaysOpen: true,
          options: [],
        },
      })
      const { vm } = wrapper

      await vm.$nextTick()

      pressEnterKey(wrapper)
    })
  })

  describe('escape key', () => {
    let wrapper, vm

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
          }, {
            id: 'b',
            label: 'b',
          } ],
          multiple: true,
          value: [ 'a', 'b' ],
        },
      })
      vm = wrapper.vm
    })

    it('should reset search query if input has value', async () => {
      await typeSearchText(wrapper, 'test')
      pressEscapeKey(wrapper)
      expect(vm.trigger.searchQuery).toBe('')
      expect(vm.forest.selectedNodeIds).toEqual([ 'a', 'b' ])
    })

    it('should close the menu if input is empty', () => {
      wrapper.vm.openMenu()
      expect(vm.trigger.searchQuery).toBe('')
      expect(vm.forest.selectedNodeIds).toEqual([ 'a', 'b' ])

      pressEscapeKey(wrapper)
      expect(vm.trigger.searchQuery).toBe('')
      expect(vm.forest.selectedNodeIds).toEqual([ 'a', 'b' ])
      expect(vm.menu.isOpen).toBe(false)
    })
  })

  describe('(home + end) keys', () => {
    const wrapper = mount(Treeselect, {
      propsData: {
        options: [ 'a', 'b', 'c' ].map(major => ({
          id: major,
          label: major,
          children: [ 'a', 'b' ].map(minor => ({
            id: major + minor,
            label: major + minor,
          })),
        })),
      },
    })
    const { vm } = wrapper

    it('preparation', () => {
      vm.openMenu()
      vm.setCurrentHighlightedOption(vm.forest.nodeMap.b)
      expect(vm.menu.current).toBe('b')
    })

    it('move to the first option using home key', () => {
      pressHomeKey(wrapper)
      expect(vm.menu.current).toBe('a')
    })

    it('move to the last option using end key', () => {
      pressEndKey(wrapper)
      expect(vm.menu.current).toBe('c')
    })

    it('with nested options', () => {
      [ 'a', 'b', 'c' ].forEach(branchNodeId => {
        const branchNode = vm.forest.nodeMap[branchNodeId]
        vm.toggleExpanded(branchNode)
        expect(branchNode.isExpanded).toBe(true)
      })

      pressHomeKey(wrapper)
      expect(vm.menu.current).toBe('a')
      pressEndKey(wrapper)
      expect(vm.menu.current).toBe('cb')
    })

    it('when searching', async () => {
      await typeSearchText(wrapper, 'ba')
      pressHomeKey(wrapper)
      expect(vm.menu.current).toBe('b')
      pressEndKey(wrapper)
      expect(vm.menu.current).toBe('ba')
    })
  })

  describe('(arrow up + arrow down) keys', () => {
    function moveAround(wrapper, idListOfVisibleOptions) {
      const { vm } = wrapper
      let index = 0
      let cycleToTop = false
      let cycleToBottom = false

      for (let i = 0; i < idListOfVisibleOptions.length * 2; i++) {
        pressArrowDown(wrapper)
        if (++index === idListOfVisibleOptions.length) {
          index = 0
          cycleToTop = true
        }
        expect(vm.menu.current).toBe(idListOfVisibleOptions[index])
      }

      for (let i = 0; i < idListOfVisibleOptions.length * 2; i++) {
        pressArrowUp(wrapper)
        if (--index < 0) {
          index = idListOfVisibleOptions.length - 1
          cycleToBottom = true
        }
        expect(vm.menu.current).toBe(idListOfVisibleOptions[index])
      }

      expect(cycleToTop && cycleToBottom).toBe(true)
    }

    it('keyboard navigation', async () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          defaultExpandLevel: Infinity,
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
            }, {
              id: 'ab',
              label: 'ab',
              children: [ {
                id: 'aba',
                label: 'aba',
              }, {
                id: 'abb',
                label: 'abb',
              } ],
            } ],
          }, {
            id: 'b',
            label: 'b',
            children: [ {
              id: 'ba',
              label: 'ba',
              children: [ {
                id: 'baa',
                label: 'baa',
              } ],
            } ],
          } ],
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()

      expect(vm.menu.current).toBe('a')
      moveAround(wrapper, [ 'a', 'aa', 'ab', 'aba', 'abb', 'b', 'ba', 'baa' ])
    })

    it('keyboard navigation when searching', async () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ 'a', 'b', 'c' ].map(major => ({
            id: major,
            label: major,
            children: [ 'a', 'b' ].map(minor => ({
              id: major + minor,
              label: major + minor,
            })),
          })),
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()

      expect(vm.menu.current).toBe('a')

      await typeSearchText(wrapper, 'a')
      expect(vm.menu.current).toBe('a')
      moveAround(wrapper, [ 'a', 'aa', 'ab', 'b', 'ba', 'c', 'ca' ])

      await typeSearchText(wrapper, 'bb')
      expect(vm.menu.current).toBe('b')
      moveAround(wrapper, [ 'b', 'bb' ])
    })

    it('keyboard navigation & delayed loading', async () => {
      const DELAY = 10
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          }, {
            id: 'b',
            label: 'b',
          } ],
          loadOptions({ action, parentNode, callback }) {
            if (action === 'LOAD_CHILDREN_OPTIONS') {
              setTimeout(() => {
                parentNode.children = [ {
                  id: 'aa',
                  label: 'aa',
                } ]
                callback(null)
              }, DELAY)
            }
          },
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()

      expect(vm.menu.current).toBe('a')

      pressArrowDown(wrapper)
      expect(vm.menu.current).toBe('b')

      pressArrowDown(wrapper)
      expect(vm.menu.current).toBe('a')

      pressArrowRight(wrapper)
      await vm.$nextTick()
      expect(vm.forest.nodeMap.a.childrenStates.isLoading).toBe(true)

      pressArrowDown(wrapper)
      expect(vm.menu.current).toBe('b')

      pressArrowUp(wrapper)
      expect(vm.menu.current).toBe('a')

      await sleep(DELAY)
      expect(vm.forest.nodeMap.a.childrenStates.isLoaded).toBe(true)
      expect(vm.forest.nodeMap.a.children).toBeArrayOfSize(1)

      pressArrowDown(wrapper)
      expect(vm.menu.current).toBe('aa')

      pressArrowDown(wrapper)
      expect(vm.menu.current).toBe('b')

      pressArrowUp(wrapper)
      expect(vm.menu.current).toBe('aa')

      pressArrowUp(wrapper)
      expect(vm.menu.current).toBe('a')
    })
  })

  describe('(arrow right + arrow left) keys', () => {
    let wrapper, vm

    beforeEach(async () => {
      wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
            }, {
              id: 'ab',
              label: 'ab',
              children: [],
            } ],
          }, {
            id: 'b',
            label: 'b',
          } ],
        },
      })
      vm = wrapper.vm

      vm.openMenu()
      await vm.$nextTick()

      expect(vm.menu.current).toBe('a')
    })

    it('toggle expanded state', () => {
      pressArrowRight(wrapper)
      expect(vm.forest.nodeMap.a.isExpanded).toBe(true)
      pressArrowLeft(wrapper)
      expect(vm.forest.nodeMap.a.isExpanded).toBe(false)
    })

    it('when a leaf node is highlighted, press arrow left to jump to its parent', () => {
      vm.toggleExpanded(vm.forest.nodeMap.a)
      expect(vm.forest.nodeMap.a.isExpanded).toBe(true)
      vm.setCurrentHighlightedOption(vm.forest.nodeMap.aa)
      expect(vm.menu.current).toBe('aa')
      // should jump from aa to a
      pressArrowLeft(wrapper)
      expect(vm.menu.current).toBe('a')

      vm.setCurrentHighlightedOption(vm.forest.nodeMap.b)
      expect(vm.menu.current).toBe('b')
      // should be no-op, since b is a root level node
      pressArrowLeft(wrapper)
      expect(vm.menu.current).toBe('b')
    })

    it('pressing arrow right on a leaf node should be no-op', () => {
      vm.setCurrentHighlightedOption(vm.forest.nodeMap.b)
      expect(vm.menu.current).toBe('b')
      expect(vm.forest.nodeMap.b.isLeaf).toBe(true)
      pressArrowRight(wrapper)
      expect(vm.menu.current).toBe('b')
    })

    it('pressing arrow right on an expanded branch node should be no-op', () => {
      expect(vm.menu.current).toBe('a')
      expect(vm.forest.nodeMap.a.isBranch).toBe(true)
      vm.toggleExpanded(vm.forest.nodeMap.a)
      expect(vm.forest.nodeMap.a.isExpanded).toBe(true)
      pressArrowRight(wrapper)
      expect(vm.menu.current).toBe('a')
    })

    it('when a branch node is collapsed, press arrow left to jump to its parent', () => {
      vm.toggleExpanded(vm.forest.nodeMap.a)
      expect(vm.forest.nodeMap.a.isExpanded).toBe(true)
      vm.toggleExpanded(vm.forest.nodeMap.ab)
      expect(vm.forest.nodeMap.ab.isExpanded).toBe(true)
      vm.setCurrentHighlightedOption(vm.forest.nodeMap.ab)
      // should collapse
      pressArrowLeft(wrapper)
      expect(vm.forest.nodeMap.ab.isExpanded).toBe(false)
      pressArrowLeft(wrapper)
      // should jump from ab to a
      expect(vm.menu.current).toBe('a')
    })

    it('toggle expanded state when searching', async () => {
      await typeSearchText(wrapper, 'ab')
      expect(vm.menu.current).toBe('a')
      expect(vm.forest.nodeMap.a.isExpandedOnSearch).toBe(true)
      pressArrowLeft(wrapper)
      expect(vm.forest.nodeMap.a.isExpandedOnSearch).toBe(false)
      pressArrowRight(wrapper)
      expect(vm.forest.nodeMap.a.isExpandedOnSearch).toBe(true)
    })
  })

  it('navigate when no options', async () => {
    const DELAY = 10
    const wrapper = mount(Vue.extend({
      components: { Treeselect },
      data: () => ({
        options: null,
      }),
      methods: {
        loadOptions({ callback }) {
          setTimeout(() => {
            wrapper.vm.options = []
            callback()
          }, DELAY)
        },
      },
      template: `
        <div>
          <treeselect
            :options="options"
            :load-options="loadOptions"
            :auto-load-root-options="false"
          />
        </div>
      `,
    }), {
      sync: false,
    })
    const { vm } = wrapper.find(Treeselect)

    vm.openMenu()

    // operate before delayed loading completes
    pressHomeKey(wrapper)
    pressEndKey(wrapper)
    pressArrowUp(wrapper)
    pressArrowDown(wrapper)

    // operate after delayed loading completes
    await sleep(DELAY)
    pressHomeKey(wrapper)
    pressEndKey(wrapper)
    pressArrowUp(wrapper)
    pressArrowDown(wrapper)
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

      expect(wrapper.vm.trigger.searchQuery).toBe('')
      expect(wrapper.vm.forest.selectedNodeIds).toEqual([ 'a', 'b' ])
    })

    it('should remove the last value if search input is empty', () => {
      pressDeleteKey(wrapper)
      expect(wrapper.vm.forest.selectedNodeIds).toEqual([ 'a' ])
      pressDeleteKey(wrapper)
      expect(wrapper.vm.forest.selectedNodeIds).toEqual([])
    })

    it('should do nothing if search input has value', async () => {
      await typeSearchText(wrapper, 'test')
      expect(wrapper.vm.trigger.searchQuery).toBe('test')
      pressDeleteKey(wrapper)
      expect(wrapper.vm.forest.selectedNodeIds).toEqual([ 'a', 'b' ])
    })

    it('should do nothing when backspaceRemoves=false', () => {
      wrapper.setProps({ deleteRemoves: false })
      pressDeleteKey(wrapper)
      expect(wrapper.vm.forest.selectedNodeIds).toEqual([ 'a', 'b' ])
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
      expect(wrapper.vm.forest.selectedNodeIds).toEqual([ 'a' ])
    })
  })

  it('any other key press should activate menu', () => {
    const wrapper = mount(Treeselect, {
      propsData: {
        options: [],
      },
    })

    expect(wrapper.vm.menu.isOpen).toBe(false)
    pressAKey(wrapper)
    expect(wrapper.vm.menu.isOpen).toBe(true)
  })
})
