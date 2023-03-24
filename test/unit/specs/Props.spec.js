import Vue from 'vue'
import { mount } from '@vue/test-utils'
import sleep from 'yaku/lib/sleep'
import {
  $,
  generateOptions,
  leftClick,
  typeSearchText,
  findInputContainer,
  findInput,
  findMenuContainer,
  findOptionByNodeId,
  findLabelContainerByNodeId,
} from './shared'
import Treeselect from '@src/components/Treeselect'
import Option from '@src/components/Option'
import MultiValueItem from '@src/components/MultiValueItem'
import {
  UNCHECKED, CHECKED, INDETERMINATE,
  ALL, BRANCH_PRIORITY, LEAF_PRIORITY, ALL_WITH_INDETERMINATE,
} from '@src/constants'

describe('Props', () => {
  describe('allowClearingDisabled', () => {
    let wrapper, vm

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          multiple: true,
          clearable: true,
          options: [ {
            id: 'a',
            label: 'a',
            isDisabled: true,
          }, {
            id: 'b',
            label: 'b',
          }, {
            id: 'c',
            label: 'c',
            isDisabled: true,
          } ],
        },
      })
      vm = wrapper.vm
    })

    describe('when allowClearingDisabled=false', () => {
      beforeEach(() => {
        wrapper.setProps({ allowClearingDisabled: false })
      })

      describe('when all selected nodes are disabled', () => {
        beforeEach(() => {
          wrapper.setProps({ value: [ 'a', 'c' ] })
        })

        it('should hide "×" button', () => {
          expect(wrapper.contains('.vue-treeselect__x')).toBe(false)
        })
      })

      describe('when not all selected nodes are disabled', () => {
        beforeEach(() => {
          wrapper.setProps({ value: [ 'a', 'b' ] })
        })

        it('should show "×" button ', () => {
          expect(wrapper.contains('.vue-treeselect__x')).toBe(true)
        })

        it('clear() should only remove undisabled value', () => {
          vm.clear()
          expect(vm.internalValue).toEqual([ 'a' ])
          expect(wrapper.contains('.vue-treeselect__x')).toBe(false)
        })
      })
    })

    describe('when allowClearingDisabled=true', () => {
      beforeEach(() => {
        wrapper.setProps({ allowClearingDisabled: true })
      })

      describe('when all selected nodes are disabled', () => {
        beforeEach(() => {
          wrapper.setProps({ value: [ 'a', 'c' ] })
        })

        it('should show "×" button', () => {
          expect(wrapper.contains('.vue-treeselect__x')).toBe(true)
        })

        it('clear() should completely reset value', () => {
          vm.clear()
          expect(vm.internalValue).toEqual([])
          expect(wrapper.contains('.vue-treeselect__x')).toBe(false)
        })
      })
    })
  })

  describe('allowSelectingDisabledDescendants', () => {
    let wrapper, vm

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          multiple: true,
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
              isDisabled: true,
              children: [ {
                id: 'aaa',
                label: 'aaa',
              } ],
            }, {
              id: 'ab',
              label: 'ab',
              isDisabled: true,
            }, {
              id: 'ac',
              label: 'ac',
            } ],
          } ],
        },
      })
      vm = wrapper.vm
    })

    describe('when allowSelectingDisabledDescendants=false', () => {
      beforeEach(() => {
        wrapper.setProps({ allowSelectingDisabledDescendants: false })
      })

      it('should not also select disabled descendants', () => {
        wrapper.setProps({ value: [] })
        vm.select(vm.forest.nodeMap.a)
        expect(vm.internalValue).toEqual([ 'ac' ])
      })

      it('should not also deselect disabled descendants', () => {
        wrapper.setProps({ value: [ 'a' ] })
        vm.select(vm.forest.nodeMap.a)
        expect(vm.internalValue).toEqual([ 'aa', 'ab' ])
      })
    })

    describe('when allowSelectingDisabledDescendants=true', () => {
      beforeEach(() => {
        wrapper.setProps({ allowSelectingDisabledDescendants: true })
      })

      it('should also select disabled descendants', () => {
        wrapper.setProps({ value: [] })
        vm.select(vm.forest.nodeMap.a)
        expect(vm.internalValue).toEqual([ 'a' ])
      })

      it('should also deselect disabled descendants', () => {
        wrapper.setProps({ value: [ 'a' ] })
        vm.select(vm.forest.nodeMap.a)
        expect(vm.internalValue).toEqual([])
      })

      it('disabled branch nodes are still unselectable', () => {
        wrapper.setProps({ value: [] })
        vm.select(vm.forest.nodeMap.aa)
        expect(vm.internalValue).toEqual([])
      })

      it('disabled branch nodes are still undeselectable', () => {
        wrapper.setProps({ value: [ 'aa' ] })
        vm.select(vm.forest.nodeMap.aa)
        expect(vm.internalValue).toEqual([ 'aa' ])
      })
    })
  })

  describe('alwaysOpen', () => {
    it('should auto open the menu on mount', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
        },
      })
      const { vm } = wrapper

      expect(vm.menu.isOpen).toBe(true)
    })

    it('should hide the arrow', async () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
        },
      })
      const { vm } = wrapper

      await vm.$nextTick() // the arrow exists on first render
      expect(wrapper.contains('.vue-treeselect__control-arrow-container')).toBe(false)
    })

    it('the menu should be unclosable', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
        },
      })
      const { vm } = wrapper

      vm.closeMenu()
      expect(vm.menu.isOpen).toBe(true)
    })

    it('when disabled=true, should not auto open the menu on mount', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
          disabled: true,
        },
      })
      const { vm } = wrapper

      expect(vm.menu.isOpen).toBe(false)
    })

    it('set disabled=true should close the already opened menu', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
          disabled: false,
        },
      })
      const { vm } = wrapper

      expect(vm.menu.isOpen).toBe(true)
      wrapper.setProps({ disabled: true })
      expect(vm.menu.isOpen).toBe(false)
    })

    it('set `disabled` from true to false should open the menu', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
          disabled: true,
        },
      })
      const { vm } = wrapper

      expect(vm.menu.isOpen).toBe(false)
      wrapper.setProps({ disabled: false })
      expect(vm.menu.isOpen).toBe(true)
    })

    it('should show the arrow when disabled', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
          disabled: true,
        },
      })

      expect(wrapper.contains('.vue-treeselect__control-arrow-container')).toBe(true)
    })

    it('set `alwaysOpen` from `false` to `true` should open the menu and hide the arrow', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: false,
        },
      })
      const { vm } = wrapper

      expect(vm.menu.isOpen).toBe(false)
      wrapper.setProps({ alwaysOpen: true })
      expect(vm.menu.isOpen).toBe(true)
      expect(wrapper.contains('.vue-treeselect__control-arrow-container')).toBe(false)
    })

    it('set `alwaysOpen` from `true` to `false` should close the menu and show the arrow', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
        },
      })
      const { vm } = wrapper

      expect(vm.menu.isOpen).toBe(true)
      wrapper.setProps({ alwaysOpen: false })
      expect(vm.menu.isOpen).toBe(false)
      expect(wrapper.contains('.vue-treeselect__control-arrow-container')).toBe(true)
    })
  })

  describe('appendToBody', () => {
    const findPortalTarget = vm => $(`.vue-treeselect__portal-target[data-instance-id="${vm.getInstanceId()}"]`)

    it('basic', async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        attachToDocument: true,
        propsData: {
          appendToBody: true,
          options: [],
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()

      const portalTarget = findPortalTarget(vm)
      expect(portalTarget.classList).toContain('vue-treeselect')
      expect(portalTarget.firstElementChild.classList).toContain('vue-treeselect__menu-container')
    })

    it('should remove portal target when component gets destroyed', async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        attachToDocument: true,
        propsData: {
          appendToBody: true,
          options: [],
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()

      expect(findPortalTarget(vm)).toBeTruthy()

      wrapper.destroy()
      await vm.$nextTick()

      expect(findPortalTarget(vm)).toBe(null)
    })

    it('should remove portal target when set back to `appendToBody: false`', async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          appendToBody: false,
          options: [],
        },
        attachToDocument: true,
      })
      const { vm } = wrapper

      expect(findPortalTarget(vm)).toBe(null)

      await wrapper.setProps({ appendToBody: true })
      expect(findPortalTarget(vm)).toBeTruthy()

      await wrapper.setProps({ appendToBody: false })
      expect(findPortalTarget(vm)).toBe(null)

      await wrapper.setProps({ appendToBody: true })
      expect(findPortalTarget(vm)).toBeTruthy()
    })

    it('portaled menu should be functional', async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          appendToBody: true,
          options: [ {
            id: 'a',
            label: 'a',
          } ],
        },
        attachToDocument: true,
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()

      const portalTarget = findPortalTarget(vm)
      const label = $('.vue-treeselect__label', portalTarget)
      expect(label.textContent.trim()).toBe('a')

      const event = document.createEvent('Event')
      event.initEvent('mousedown', true, true)
      event.button = 0
      label.dispatchEvent(event)
      expect(vm.internalValue).toEqual([ 'a' ])
    })

    it('should set `z-index` on menu container when appendToBody=false', async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          zIndex: 1,
          appendToBody: false,
          options: [],
        },
        attachToDocument: true,
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()

      const menuContainer = findMenuContainer(wrapper)
      expect(menuContainer.element.style.zIndex).toBe('1')
    })

    it('should set `z-index` on portal target when appendToBody=true', async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          zIndex: 1,
          appendToBody: true,
          options: [],
        },
        attachToDocument: true,
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()

      const portalTarget = findPortalTarget(vm)
      expect(portalTarget.style.zIndex).toBe('1')

      const $menuContainer = $('.vue-treeselect__menu-container', portalTarget)
      expect($menuContainer.style.zIndex).toBe('')
    })
  })

  describe('async', () => {
    it('must be with searchable=true', () => {
      spyOn(console, 'error')

      mount(Treeselect, {
        propsData: {
          async: true,
          searchable: false,
          loadOptions() { /* empty */ },
        },
      })

      expect(console.error).toHaveBeenCalledWith(
        '[Vue-Treeselect Warning]',
        'For async search mode, the value of "searchable" prop must be true.',
      )
    })
  })

  describe('autoFocus', () => {
    it('should focus the search input on mount', () => {
      const wrapper = mount(Treeselect, {
        attachToDocument: true,
        propsData: {
          options: [],
          autoFocus: true,
          searchable: true,
        },
      })
      const input = findInput(wrapper)
      expect(document.activeElement).toBe(input.element)
    })
  })

  describe('auto(De)SelectX', () => {
    let wrapper, vm

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          multiple: true,
          flat: true,
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
              children: [ {
                id: 'aaa',
                label: 'aaa',
              }, {
                id: 'aab',
                label: 'aab',
              } ],
            }, {
              id: 'ab',
              label: 'ab',
            } ],
          }, {
            id: 'b',
            label: 'b',
            children: [ {
              id: 'ba',
              label: 'ba',
              isDisabled: true,
              children: [ {
                id: 'baa',
                label: 'baa',
              } ],
            } ],
          }, {
            id: 'c',
            label: 'c',
          } ],
        },
      })
      vm = wrapper.vm
    })

    it('autoSelectAncestors', () => {
      wrapper.setProps({
        autoSelectAncestors: true,
        value: [ 'aa' ],
      })
      expect(vm.internalValue).toEqual([ 'aa' ])

      vm.select(vm.forest.nodeMap.aaa)
      expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'a' ])
    })

    it('autoSelectAncestors + disabled nodes', () => {
      wrapper.setProps({
        autoSelectAncestors: true,
        value: [],
      })
      expect(vm.internalValue).toEqual([])

      vm.select(vm.forest.nodeMap.baa)
      expect(vm.internalValue).toEqual([ 'baa', 'b' ])
    })

    it('autoSelectDescendants', () => {
      wrapper.setProps({
        autoSelectDescendants: true,
        value: [ 'aa' ],
      })
      expect(vm.internalValue).toEqual([ 'aa' ])

      vm.select(vm.forest.nodeMap.a)
      expect(vm.internalValue).toEqual([ 'aa', 'a', 'ab', 'aaa', 'aab' ])
    })

    it('autoSelectDescendants + disabled nodes', () => {
      wrapper.setProps({
        autoSelectDescendants: true,
        value: [],
      })
      expect(vm.internalValue).toEqual([])

      vm.select(vm.forest.nodeMap.b)
      expect(vm.internalValue).toEqual([ 'b', 'baa' ])
    })

    it('autoDeselectAncestors', () => {
      wrapper.setProps({
        autoDeselectAncestors: true,
        value: [ 'aa', 'aaa', 'aab' ],
      })
      expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab' ])

      vm.select(vm.forest.nodeMap.aaa)
      expect(vm.internalValue).toEqual([ 'aab' ])
    })

    it('autoDeselectAncestors + disabled nodes', () => {
      wrapper.setProps({
        autoDeselectAncestors: true,
        value: [ 'b', 'ba', 'baa' ],
      })
      expect(vm.internalValue).toEqual([ 'b', 'ba', 'baa' ])

      vm.select(vm.forest.nodeMap.baa)
      expect(vm.internalValue).toEqual([ 'ba' ])
    })

    it('autoDeselectDescendants', () => {
      wrapper.setProps({
        autoDeselectDescendants: true,
        value: [ 'a', 'aaa', 'aab' ],
      })
      expect(vm.internalValue).toEqual([ 'a', 'aaa', 'aab' ])

      vm.select(vm.forest.nodeMap.a)
      expect(vm.internalValue).toEqual([])
    })

    it('autoDeselectDescendants + disabled nodes', () => {
      wrapper.setProps({
        autoDeselectDescendants: true,
        value: [ 'b', 'ba', 'baa' ],
      })
      expect(vm.internalValue).toEqual([ 'b', 'ba', 'baa' ])

      vm.select(vm.forest.nodeMap.b)
      expect(vm.internalValue).toEqual([ 'ba' ])
    })

    it('must be used in conjunction with `flat=true`', () => {
      spyOn(console, 'error')

      function test(propName) {
        mount(Treeselect, {
          propsData: {
            [propName]: true,
            multiple: true,
            options: [],
          },
        })

        expect(console.error).toHaveBeenCalledWith(
          '[Vue-Treeselect Warning]',
          `"${propName}" only applies to flat mode.`,
        )
        console.error.calls.reset()
      }

      test('autoSelectAncestors')
      test('autoSelectDescendants')
      test('autoDeselectAncestors')
      test('autoDeselectDescendants')
    })
  })

  describe('beforeClearAll', () => {
    async function clickOnX(wrapper) {
      const x = wrapper.find('.vue-treeselect__x-container')
      leftClick(x)
      // the `beforeClearAll` callback is always called async
      // we have to wait here
      await sleep(0)
    }

    it('the returned value determines whether to clear values', async () => {
      let shouldClear
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
          } ],
          value: 'a',
          beforeClearAll: () => shouldClear,
        },
      })
      const { vm } = wrapper

      shouldClear = false
      await clickOnX(wrapper)
      expect(vm.internalValue).toEqual([ 'a' ])

      shouldClear = true
      await clickOnX(wrapper)
      expect(vm.internalValue).toBeEmptyArray()
    })

    it('should support the callback returning a promise', async () => {
      let shouldClear
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
          } ],
          value: 'a',
          beforeClearAll: () => Promise.resolve(shouldClear),
        },
      })
      const { vm } = wrapper

      shouldClear = false
      await clickOnX(wrapper)
      expect(vm.internalValue).toEqual([ 'a' ])

      shouldClear = true
      await clickOnX(wrapper)
      expect(vm.internalValue).toBeEmptyArray()
    })
  })

  describe('branchNodesFirst', () => {
    it('should place branch nodes ahead of leaf nodes when branchNodesFirst=true', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          branchNodesFirst: true,
          options: [ {
            id: 'a',
            label: 'a',
          }, {
            id: 'b',
            label: 'b',
            children: [ {
              id: 'ba',
              label: 'ba',
            }, {
              id: 'bb',
              label: 'bb',
              children: [ {
                id: 'bba',
                label: 'bba',
              } ],
            }, {
              id: 'bc',
              label: 'bc',
            } ],
          }, {
            id: 'c',
            label: 'c',
          } ],
        },
      })
      const { vm } = wrapper

      expect(vm.forest.normalizedOptions.map(node => node.id)).toEqual([ 'b', 'a', 'c' ])
      expect(vm.forest.nodeMap.b.children.map(node => node.id)).toEqual([ 'bb', 'ba', 'bc' ])
    })

    it('index', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
          }, {
            id: 'b',
            label: 'b',
            children: [ {
              id: 'ba',
              label: 'ba',
            }, {
              id: 'bb',
              label: 'bb',
              children: [],
            } ],
          } ],
        },
      })
      const { vm } = wrapper

      // TODO
      // wrapper.setProps({ branchNodesFirst: true })
      // expect(vm.forest.nodeMap).toEqual({
      //   a: jasmine.objectContaining({ index: [ 1 ] }),
      //   b: jasmine.objectContaining({ index: [ 0 ] }),
      //   ba: jasmine.objectContaining({ index: [ 0, 1 ] }),
      //   bb: jasmine.objectContaining({ index: [ 0, 0 ] }),
      // })

      wrapper.setProps({ branchNodesFirst: false })
      expect(vm.forest.nodeMap).toEqual({
        a: jasmine.objectContaining({ index: [ 0 ] }),
        b: jasmine.objectContaining({ index: [ 1 ] }),
        ba: jasmine.objectContaining({ index: [ 1, 0 ] }),
        bb: jasmine.objectContaining({ index: [ 1, 1 ] }),
      })
    })

    it('should resort nodes after value of `branchNodesFirst` changes', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          branchNodesFirst: false,
          options: [ {
            id: 'a',
            label: 'a',
          }, {
            id: 'b',
            label: 'b',
            children: [ {
              id: 'ba',
              label: 'ba',
            }, {
              id: 'bb',
              label: 'bb',
              children: [],
            }, {
              id: 'bc',
              label: 'bc',
            } ],
          }, {
            id: 'c',
            label: 'c',
          } ],
        },
      })
      const { vm } = wrapper

      expect(vm.forest.normalizedOptions.map(node => node.id)).toEqual([ 'a', 'b', 'c' ])
      expect(vm.forest.nodeMap.b.children.map(node => node.id)).toEqual([ 'ba', 'bb', 'bc' ])

      wrapper.setProps({ branchNodesFirst: true })

      expect(vm.forest.normalizedOptions.map(node => node.id)).toEqual([ 'b', 'a', 'c' ])
      expect(vm.forest.nodeMap.b.children.map(node => node.id)).toEqual([ 'bb', 'ba', 'bc' ])
    })
  })

  describe('clearable', () => {
    let wrapper, vm

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          multiple: false,
          clearable: true,
          options: [ { id: 'a', label: 'a' } ],
          value: 'a',
        },
      })
      vm = wrapper.vm
    })

    it('should show "×" button', () => {
      expect(wrapper.contains('.vue-treeselect__x')).toBe(true)
    })

    it('should reset value on mousedown', async () => {
      expect(vm.forest.selectedNodeIds).toEqual([ 'a' ])
      leftClick(wrapper.find('.vue-treeselect__x-container'))
      await sleep(1)
      expect(vm.forest.selectedNodeIds).toEqual([])
    })

    it('should hide when no options selected', () => {
      wrapper.setProps({ value: null })
      expect(wrapper.contains('.vue-treeselect__x')).toBe(false)
    })

    it('should hide when disabled=true', () => {
      wrapper.setProps({ disabled: true })
      expect(wrapper.contains('.vue-treeselect__x')).toBe(false)
    })

    it('should hide when clearable=false', () => {
      wrapper.setProps({ clearable: false })
      expect(wrapper.contains('.vue-treeselect__x')).toBe(false)
    })
  })

  describe('clearAllText', () => {
    it('should be the title of "×" button when multiple=true', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          clearable: true,
          multiple: true,
          clearAllText: '$MULTI_TITLE$',
          options: [ { id: 'a', label: 'a' } ],
          value: [ 'a' ],
        },
      })

      expect(wrapper.find('.vue-treeselect__x-container').attributes().title).toBe('$MULTI_TITLE$')
    })
  })

  describe('clearOnSelect', () => {
    describe('when multiple=false', () => {
      it('clears the input after selecting when clearOnSelect=true', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            clearOnSelect: true,
            multiple: false,
            options: [ { id: 'a', label: 'a' } ],
          },
        })
        const { vm } = wrapper
        vm.localSearch.active = true
        vm.trigger.searchQuery = '$SEARCH_QUERY$'

        vm.select(vm.forest.nodeMap.a)
        expect(vm.trigger.searchQuery).toBe('')
      })

      it('still clears the input after selecting even if clearOnSelect!=true', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            clearOnSelect: false,
            multiple: false,
            options: [ { id: 'a', label: 'a' } ],
          },
        })
        const { vm } = wrapper
        vm.localSearch.active = true
        vm.trigger.searchQuery = '$SEARCH_QUERY$'

        vm.select(vm.forest.nodeMap.a)
        expect(vm.trigger.searchQuery).toBe('')
      })
    })

    describe('when multiple=true', () => {
      it('clears the input after selecting when clearOnSelect=true', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            clearOnSelect: true,
            multiple: true,
            options: [ { id: 'a', label: 'a' } ],
          },
        })
        const { vm } = wrapper
        vm.localSearch.active = true
        vm.trigger.searchQuery = '$SEARCH_QUERY$'

        vm.select(vm.forest.nodeMap.a)
        expect(vm.trigger.searchQuery).toBe('')
      })

      it("won't clear the input after selecting when clearOnSelect!=true", () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            clearOnSelect: false,
            multiple: true,
            options: [ { id: 'a', label: 'a' } ],
          },
        })
        const { vm } = wrapper
        vm.localSearch.active = true
        vm.trigger.searchQuery = '$SEARCH_QUERY$'

        vm.select(vm.forest.nodeMap.a)
        expect(vm.trigger.searchQuery).toBe('$SEARCH_QUERY$')
      })
    })
  })

  describe('clearValueText', () => {
    it('should be the title of "×" button when multiple=false', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          clearable: true,
          multiple: false,
          clearValueText: '$SINGLE_TITLE$',
          options: [ { id: 'a', label: 'a' } ],
          value: 'a',
        },
      })

      expect(wrapper.find('.vue-treeselect__x-container').attributes().title).toBe('$SINGLE_TITLE$')
    })
  })

  describe('closeOnSelect', () => {
    it('closes the menu after selecting when closeOnSelect=true', async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          closeOnSelect: true,
          multiple: false,
          options: [ { id: 'a', label: 'a' } ],
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()

      const labelContainer = findLabelContainerByNodeId(wrapper, 'a')

      leftClick(labelContainer)
      expect(vm.forest.selectedNodeIds).toEqual([ 'a' ])
      expect(vm.menu.isOpen).toBe(false)
    })

    it('keeps the menu open after selecting when closeOnSelect=false', async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          closeOnSelect: false,
          multiple: false,
          searchable: true,
          options: [ { id: 'a', label: 'a' } ],
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()

      const labelContainer = findLabelContainerByNodeId(wrapper, 'a')

      leftClick(labelContainer)
      expect(vm.forest.selectedNodeIds).toEqual([ 'a' ])
      expect(vm.menu.isOpen).toBe(true)
      expect(vm.trigger.isFocused).toBe(false) // auto blur
    })
  })

  describe('defaultExpandLevel', () => {
    it('when defaultExpandLevel=0', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: [],
          } ],
          defaultExpandLevel: 0,
        },
      })
      const { vm } = wrapper
      const { a } = vm.forest.nodeMap

      expect(a.isExpanded).toBe(false)
    })

    it('when defaultExpandLevel=1', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
              children: [],
            } ],
          } ],
          defaultExpandLevel: 1,
        },
      })
      const { vm } = wrapper
      const { a, aa } = vm.forest.nodeMap

      expect(a.isExpanded).toBe(true)
      expect(aa.isExpanded).toBe(false)
    })

    it('when defaultExpandLevel=Infinity', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
              children: [],
            } ],
          } ],
          defaultExpandLevel: Infinity,
        },
      })
      const { vm } = wrapper
      const { a, aa } = vm.forest.nodeMap

      expect(a.isExpanded).toBe(true)
      expect(aa.isExpanded).toBe(true)
    })

    it('with `node.isDefaultExpanded`', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
              children: [],
            } ],
          }, {
            id: 'b',
            label: 'b',
            isDefaultExpanded: false,
            children: [ {
              id: 'bb',
              label: 'bb',
              isDefaultExpanded: true,
              children: [],
            } ],
          } ],
          defaultExpandLevel: 1,
        },
      })
      const { a, aa, b, bb } = wrapper.vm.forest.nodeMap

      expect(a.isExpanded).toBe(true)
      expect(aa.isExpanded).toBe(false)
      expect(b.isExpanded).toBe(true)
      expect(bb.isExpanded).toBe(true)
    })

    it('should request children options loading when expanded', () => {
      // TODO: 需要考虑服务端渲染的情况
      const loadOptions = jasmine.createSpy('loadOptions')
      const wrapper = mount(Treeselect, {
        propsData: {
          instanceId: 'test',
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          }, {
            id: 'b',
            label: 'b',
            children: [ {
              id: 'bb',
              label: 'bb',
              children: null,
            } ],
          } ],
          defaultExpandLevel: 1,
          loadOptions,
        },
      })
      const { vm } = wrapper
      const { a } = vm.forest.nodeMap

      expect(loadOptions.calls.count()).toBe(1)
      expect(loadOptions).toHaveBeenCalledWith({
        id: 'test',
        instanceId: 'test',
        action: 'LOAD_CHILDREN_OPTIONS',
        parentNode: a.raw,
        callback: jasmine.any(Function),
      })
    })
  })

  describe('disableBranchNodes', () => {
    let wrapper, vm

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          defaultExpandLevel: Infinity,
          flat: false,
          options: [ {
            id: 'branch',
            label: 'branch',
            children: [ {
              id: 'leaf',
              label: 'leaf',
            } ],
          } ],
        },
      })
      vm = wrapper.vm
    })

    const getLabelContainerOfBranchNode = async () => {
      vm.openMenu() // ensure the menu is opened otherwise the options won't be displayed
      await vm.$nextTick()

      return findLabelContainerByNodeId(wrapper, 'branch')
    }

    const getLabelContainerOfLeafNode = async () => {
      vm.openMenu() // ensure the menu is opened otherwise the options won't be displayed
      await vm.$nextTick()

      return findLabelContainerByNodeId(wrapper, 'leaf')
    }

    const clickOnLabelOfBranchNode = async () => {
      const labelContainerOfBranchNode = await getLabelContainerOfBranchNode()
      leftClick(labelContainerOfBranchNode)
    }

    describe('when disableBranchNodes=false', () => {
      beforeEach(() => {
        wrapper.setProps({ disableBranchNodes: false })
      })

      it('a branch node should have checkbox when multiple=true', async () => {
        wrapper.setProps({ multiple: true })

        const labelContainerOfBranchNode = await getLabelContainerOfBranchNode()

        expect(labelContainerOfBranchNode.contains('.vue-treeselect__checkbox')).toBe(true)
      })

      it('a leaf node should have checkbox too when multiple=true', async () => {
        wrapper.setProps({ multiple: true })

        const labelContainerOfLeafNode = await getLabelContainerOfLeafNode()

        expect(labelContainerOfLeafNode.contains('.vue-treeselect__checkbox')).toBe(true)
      })

      it('click on label of a branch node should toggle checking state when multiple=true', async () => {
        wrapper.setProps({ multiple: true })

        expect(vm.isSelected(vm.forest.nodeMap.branch)).toBe(false)
        await clickOnLabelOfBranchNode()
        expect(vm.isSelected(vm.forest.nodeMap.branch)).toBe(true)
        await clickOnLabelOfBranchNode()
        expect(vm.isSelected(vm.forest.nodeMap.branch)).toBe(false)
      })

      it('click on label of a branch node should not toggle expanding state when multiple=true', async () => {
        wrapper.setProps({ multiple: true })

        expect(vm.forest.nodeMap.branch.isExpanded).toBe(true)
        await clickOnLabelOfBranchNode()
        expect(vm.forest.nodeMap.branch.isExpanded).toBe(true)
      })

      it('click on label of a branch node should close the dropdown when multiple=false & closeOnSelect=true', async () => {
        wrapper.setProps({ multiple: false, closeOnSelect: true })
        vm.openMenu()
        await vm.$nextTick()

        expect(vm.menu.isOpen).toBe(true)
        await clickOnLabelOfBranchNode()
        expect(vm.menu.isOpen).toBe(false)
      })
    })

    describe('when disableBranchNodes=true', () => {
      beforeEach(() => {
        wrapper.setProps({ disableBranchNodes: true })
      })

      it('a branch node should not have checkbox when multiple=true', async () => {
        wrapper.setProps({ multiple: true })
        const labelContainerOfBranchNode = await getLabelContainerOfBranchNode()

        expect(labelContainerOfBranchNode.contains('.vue-treeselect__checkbox')).toBe(false)
      })

      it('a leaf node should have checkbox when multiple=true', async () => {
        wrapper.setProps({ multiple: true })
        const labelContainerOfLeafNode = await getLabelContainerOfLeafNode()

        expect(labelContainerOfLeafNode.contains('.vue-treeselect__checkbox')).toBe(true)
      })

      it('click on label of a branch node should not toggle checking state when multiple=true', async () => {
        wrapper.setProps({ multiple: true })

        expect(vm.isSelected(vm.forest.nodeMap.branch)).toBe(false)
        await clickOnLabelOfBranchNode()
        expect(vm.isSelected(vm.forest.nodeMap.branch)).toBe(false)
      })

      it('click on label of a branch node should toggle expanding state when multiple=true', async () => {
        wrapper.setProps({ multiple: true })

        expect(vm.forest.nodeMap.branch.isExpanded).toBe(true)
        await clickOnLabelOfBranchNode()
        expect(vm.forest.nodeMap.branch.isExpanded).toBe(false)
        await clickOnLabelOfBranchNode()
        expect(vm.forest.nodeMap.branch.isExpanded).toBe(true)
      })

      it('click on label of a branch node should not close the dropdown when multiple=false & closeOnSelect=true', async () => {
        wrapper.setProps({ multiple: false, closeOnSelect: true })
        vm.openMenu()
        await vm.$nextTick()

        expect(vm.menu.isOpen).toBe(true)
        await clickOnLabelOfBranchNode()
        expect(vm.menu.isOpen).toBe(true)
      })

      it('should not auto-select ancestor nodes like flat mode', async () => {
        wrapper.setProps({ multiple: true })
        await vm.$nextTick()

        vm.select(vm.forest.nodeMap.leaf)
        expect(vm.forest.checkedStateMap).toEqual({ branch: UNCHECKED, leaf: CHECKED })
        expect(vm.forest.selectedNodeMap).toEqual({ leaf: true })
        expect(vm.forest.selectedNodeIds).toEqual([ 'leaf' ])
        expect(vm.internalValue).toEqual([ 'leaf' ])
        vm.select(vm.forest.nodeMap.leaf)
        expect(vm.internalValue).toEqual([])
      })

      describe('combined with valueConsistsOf (multi-select mode)', () => {
        const types = [ 'ALL', 'BRANCH_PRIORITY', 'LEAF_PRIORITY', 'ALL_WITH_INDETERMINATE' ]

        types.forEach(valueConsistsOf => {
          it(`when valueConsistsOf=${valueConsistsOf}`, async () => {
            wrapper.setProps({
              multiple: true,
              valueConsistsOf,
              value: [ 'leaf' ],
            })
            await vm.$nextTick()

            expect(vm.forest.checkedStateMap).toEqual({ branch: UNCHECKED, leaf: CHECKED })
            expect(vm.forest.selectedNodeMap).toEqual({ leaf: true })
            expect(vm.forest.selectedNodeIds).toEqual([ 'leaf' ])
            expect(vm.internalValue).toEqual([ 'leaf' ])
          })
        })
      })
    })
  })

  describe('disabled', () => {
    it('when disabled=false', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          searchable: true,
          disabled: false,
        },
      })

      expect(wrapper.contains('.vue-treeselect__input-container')).toBe(true)
      expect(wrapper.contains('.vue-treeselect__input')).toBe(true)
    })

    describe('when disabled=true', () => {
      it('should hide the input but keep the input wrapper', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            options: [],
            searchable: true,
            disabled: true,
          },
        })

        expect(wrapper.contains('.vue-treeselect__input-container')).toBe(true)
        expect(wrapper.contains('.vue-treeselect__input')).toBe(false)
      })

      it('should close the menu when setting disabled from false to true', async () => {
        const wrapper = mount(Treeselect, {
          sync: false,
          propsData: {
            options: [],
            disabled: false,
          },
        })
        const { vm } = wrapper

        vm.openMenu()
        await vm.$nextTick()

        expect(wrapper.vm.menu.isOpen).toBe(true)

        wrapper.setProps({ disabled: true })
        await vm.$nextTick()

        expect(wrapper.vm.menu.isOpen).toBe(false)
      })

      it('the control should reject all clicks', () => {
        const wrapper = mount(Treeselect, {
          attachToDocument: true,
          propsData: {
            options: [],
            disabled: true,
          },
        })
        const { vm } = wrapper
        const valeContainer = wrapper.find('.vue-treeselect__value-container')

        leftClick(valeContainer)
        expect(vm.trigger.isFocused).toBe(false)
        expect(vm.menu.isOpen).toBe(false)
      })

      it('the control should be non-focusable', () => {
        const wrapper = mount(Treeselect, {
          attachToDocument: true,
          propsData: {
            options: [],
            disabled: true,
          },
        })
        const { vm } = wrapper

        wrapper.vm.focusInput()
        expect(vm.trigger.isFocused).toBe(false)
      })

      it('should be uanble to open the menu', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            options: [],
            disabled: true,
          },
        })
        const { vm } = wrapper

        wrapper.vm.openMenu()
        expect(vm.menu.isOpen).toBe(false)
      })
    })
  })

  describe('disableFuzzyMatching', () => {
    let wrapper, vm

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'jamesblunt',
            label: 'James Blunt',
          } ],
        },
      })
      vm = wrapper.vm
    })

    it('when disableFuzzyMatching=false', async () => {
      wrapper.setProps({ disableFuzzyMatching: false })
      await typeSearchText(wrapper, 'jb')
      expect(vm.forest.nodeMap.jamesblunt.isMatched).toBe(true)
    })

    it('when disableFuzzyMatching=true', async () => {
      wrapper.setProps({ disableFuzzyMatching: true })
      await typeSearchText(wrapper, 'jb')
      expect(vm.forest.nodeMap.jamesblunt.isMatched).toBe(false)
    })
  })

  describe('flat', () => {
    it('must be used in conjunction with `multiple=true`', () => {
      spyOn(console, 'error')

      mount(Treeselect, {
        propsData: {
          options: [],
          flat: true,
        },
      })

      expect(console.error).toHaveBeenCalledWith(
        '[Vue-Treeselect Warning]',
        'You are using flat mode. But you forgot to add "multiple=true"?',
      )
    })
  })

  describe('instanceId', () => {
    it('default value', () => {
      const createInstance = () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            options: [],
          },
        })
        return wrapper.vm
      }
      const vm1 = createInstance()
      const vm2 = createInstance()

      expect(vm1.instanceId).toEndWith('$$')
      expect(vm2.instanceId).toEndWith('$$')
      expect(vm1.instanceId).not.toBe(vm2.instanceId)
    })
  })

  describe('limit', () => {
    it('when limit=Infinity', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          multiple: true,
          limit: Infinity,
          value: [ 'a', 'b', 'c', 'd' ],
          options: [ {
            id: 'a',
            label: 'a',
          }, {
            id: 'b',
            label: 'b',
          }, {
            id: 'c',
            label: 'c',
          }, {
            id: 'd',
            label: 'd',
          } ],
        },
      })
      const { vm } = wrapper

      expect(vm.forest.selectedNodeIds).toEqual([ 'a', 'b', 'c', 'd' ])
      expect(wrapper.findAll(MultiValueItem).length).toBe(4)
      expect(wrapper.contains('.vue-treeselect__limit-tip')).toBe(false)
    })

    it('when limit=1', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          multiple: true,
          limit: 1,
          value: [ 'a', 'b', 'c', 'd' ],
          options: [ {
            id: 'a',
            label: 'a',
          }, {
            id: 'b',
            label: 'b',
          }, {
            id: 'c',
            label: 'c',
          }, {
            id: 'd',
            label: 'd',
          } ],
        },
      })
      const { vm } = wrapper

      expect(vm.forest.selectedNodeIds).toEqual([ 'a', 'b', 'c', 'd' ])
      expect(wrapper.findAll(MultiValueItem).length).toBe(1)
      expect(wrapper.contains('.vue-treeselect__limit-tip')).toBe(true)
      expect(wrapper.find('.vue-treeselect__limit-tip').text()).toBe('and 3 more')
    })
  })

  describe('normalizer', () => {
    it('customizing key names', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            key: 'a',
            name: 'a',
          } ],
          normalizer(node) {
            return {
              id: node.key,
              label: node.name,
            }
          },
        },
      })
      const { vm } = wrapper

      expect(vm.forest.nodeMap.a).toEqual(jasmine.objectContaining({
        id: 'a',
        label: 'a',
        raw: {
          key: 'a',
          name: 'a',
        },
      }))
    })

    it('with fallback node', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          value: {
            key: 'a',
            name: 'a',
          },
          options: [],
          valueFormat: 'object',
          normalizer(node) {
            return {
              id: node.key,
              label: node.name,
            }
          },
        },
      })
      const { vm } = wrapper

      expect(vm.forest.selectedNodeIds).toEqual([ 'a' ])
      expect(vm.forest.nodeMap.a).toEqual(jasmine.objectContaining({
        id: 'a',
        label: 'a',
        isFallbackNode: true,
        raw: {
          key: 'a',
          name: 'a',
        },
      }))
    })

    it('multiple instances share the same `normalizer` function', () => {
      const normalizer = (node, instanceId) => ({
        id: instanceId + '-' + node.key,
        label: node.name,
      })
      const { vm: vm1 } = mount(Treeselect, {
        propsData: {
          instanceId: 1,
          options: [ {
            key: 'a',
            name: 'a',
          } ],
          normalizer,
        },
      })
      const { vm: vm2 } = mount(Treeselect, {
        propsData: {
          instanceId: 2,
          options: [ {
            key: 'a',
            name: 'a',
          } ],
          normalizer,
        },
      })

      expect(Object.keys(vm1.forest.nodeMap)).toEqual([ '1-a' ])
      expect(Object.keys(vm2.forest.nodeMap)).toEqual([ '2-a' ])
    })

    it('provide only the keys that need to be customized', () => {
      const normalizer = node => ({ id: node.key })
      const wrapper = mount(Treeselect, {
        propsData: {
          normalizer,
          options: [ {
            key: 'a',
            label: 'a',
            children: [ {
              key: 'aa',
              label: 'aa',
            } ],
          } ],
        },
      })
      const { vm } = wrapper

      expect(vm.forest.nodeMap.a).toEqual(jasmine.objectContaining({
        id: 'a',
        label: 'a',
      }))
      expect(vm.forest.nodeMap.aa).toEqual(jasmine.objectContaining({
        id: 'aa',
        label: 'aa',
      }))
    })

    it('with `loadOptions` prop', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            key: 'a', // customized key
            label: 'a',
            subitems: null, // customized key
          } ],
          normalizer(node) {
            return {
              id: node.key,
              children: node.subitems,
            }
          },
          loadOptions({ action, parentNode, callback }) {
            expect(action).toBe('LOAD_CHILDREN_OPTIONS')
            expect(parentNode).toHaveMember('key')
            expect(parentNode).toHaveMember('subitems')

            parentNode.subitems = [ {
              key: 'aa', // customized key
              label: 'aa',
            } ]
            callback()
          },
        },
      })
      const { vm } = wrapper

      vm.toggleExpanded(vm.forest.nodeMap.a)
      expect(vm.forest.nodeMap.a.children).toBeNonEmptyArray()
    })
  })

  describe('openOnClick', () => {
    it('when openOnClick=false', () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        attachToDocument: true,
        propsData: {
          options: [],
          openOnClick: false,
        },
      })
      const { vm } = wrapper
      const valeContainer = wrapper.find('.vue-treeselect__value-container')

      expect(vm.trigger.isFocused).toBe(false)
      expect(vm.menu.isOpen).toBe(false)

      leftClick(valeContainer)
      expect(vm.trigger.isFocused).toBe(true)
      expect(vm.menu.isOpen).toBe(false)

      leftClick(valeContainer)
      expect(vm.trigger.isFocused).toBe(true)
      expect(vm.menu.isOpen).toBe(true)
    })

    it('when openOnClick=true', () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        attachToDocument: true,
        propsData: {
          options: [],
          openOnClick: true,
        },
      })
      const { vm } = wrapper
      const valeContainer = wrapper.find('.vue-treeselect__value-container')

      expect(vm.trigger.isFocused).toBe(false)
      expect(vm.menu.isOpen).toBe(false)

      leftClick(valeContainer)
      expect(vm.trigger.isFocused).toBe(true)
      expect(vm.menu.isOpen).toBe(true)
    })
  })

  describe('openOnFocus', () => {
    it('when openOnFocus=false', () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        attachToDocument: true,
        propsData: {
          options: [],
          openOnFocus: false,
        },
      })
      const { vm } = wrapper
      const valeContainer = wrapper.find('.vue-treeselect__value-container')

      expect(vm.trigger.isFocused).toBe(false)
      expect(vm.menu.isOpen).toBe(false)

      wrapper.vm.focusInput()
      expect(vm.trigger.isFocused).toBe(true)
      expect(vm.menu.isOpen).toBe(false)

      leftClick(valeContainer)
      expect(vm.trigger.isFocused).toBe(true)
      expect(vm.menu.isOpen).toBe(true)
    })

    it('when openOnFocus=true', () => {
      const wrapper = mount(Treeselect, {
        attachToDocument: true,
        propsData: {
          options: [],
          openOnFocus: true,
        },
      })
      const { vm } = wrapper

      expect(vm.trigger.isFocused).toBe(false)
      expect(vm.menu.isOpen).toBe(false)

      wrapper.vm.focusInput()
      expect(vm.trigger.isFocused).toBe(true)
      expect(vm.menu.isOpen).toBe(true)
    })

    describe('combined with autoFocus', () => {
      it('when openOnFocus=false', () => {
        const wrapper = mount(Treeselect, {
          sync: false,
          attachToDocument: true,
          propsData: {
            options: [],
            autoFocus: true,
            openOnFocus: false,
          },
        })
        const { vm } = wrapper

        expect(vm.trigger.isFocused).toBe(true)
        expect(vm.menu.isOpen).toBe(false)
      })

      it('when openOnFocus=true', () => {
        const wrapper = mount(Treeselect, {
          sync: false,
          attachToDocument: true,
          propsData: {
            options: [],
            autoFocus: true,
            openOnFocus: true,
          },
        })
        const { vm } = wrapper

        expect(vm.trigger.isFocused).toBe(true)
        expect(vm.menu.isOpen).toBe(true)
      })
    })
  })

  describe('options', () => {
    it('show tip when `options` is an empty array', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
        },
      })

      wrapper.vm.openMenu()

      const menu = wrapper.find('.vue-treeselect__menu')
      const noOptionsTip = menu.find('.vue-treeselect__no-options-tip')
      expect(noOptionsTip.text().trim()).toBe('No options available.')
    })

    describe('should be reactive', () => {
      it('should override fallback node', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            options: [],
            value: 'a', // this creates a fallback node
          },
        })
        const { vm } = wrapper

        expect(vm.forest.nodeMap.a).toEqual(jasmine.objectContaining({
          isFallbackNode: true,
          label: 'a (unknown)',
        }))

        wrapper.setProps({
          options: [ {
            id: 'a',
            label: 'a',
          } ],
        })
        expect(vm.forest.nodeMap.a.label).toBe('a')
      })

      it('directly modify `options` prop should trigger reinitializing', async () => {
        const vm = new Vue({
          components: { Treeselect },
          data: {
            options: [ {
              id: 'a',
              label: 'a',
            } ],
          },
          template: `<div><treeselect :options="options" /></div>`,
        }).$mount()
        const comp = vm.$children[0]

        // note that, this is directly modifying the original `options` array,
        // not creating a new `options` array.
        vm.options[0].label = 'xxx'
        await vm.$nextTick()
        expect(comp.forest.nodeMap.a.label).toBe('xxx')
      })

      it('should keep state', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            multiple: true,
            options: [ {
              id: 'a',
              label: 'a',
              children: [ {
                id: 'aa',
                label: 'aa',
              } ],
            } ],
            value: [ 'a' ],
          },
        })
        const { vm } = wrapper

        vm.toggleExpanded(vm.forest.nodeMap.a)
        expect(vm.isSelected(vm.forest.nodeMap.a)).toBe(true)
        expect(vm.forest.nodeMap.a.isExpanded).toBe(true)
        expect(vm.forest.checkedStateMap).toEqual({
          a: CHECKED,
          aa: CHECKED,
        })

        wrapper.setProps({
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
            }, {
              // add new option
              id: 'ab',
              label: 'ab',
            } ],
          }, {
            // add new option
            id: 'b',
            label: 'b',
          } ],
        })
        expect(vm.isSelected(vm.forest.nodeMap.a)).toBe(true)
        expect(vm.forest.nodeMap.a.isExpanded).toBe(true)
        expect(vm.forest.checkedStateMap).toEqual({
          a: CHECKED,
          aa: CHECKED,
          ab: CHECKED,
          b: UNCHECKED,
        })
      })

      it('should keep the state of selected nodes even if they are not present in `nodeMap`', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            options: [ {
              id: 'a',
              label: 'a',
            } ],
            value: 'a',
          },
        })
        const { vm } = wrapper

        expect(vm.forest.nodeMap.a.label).toBe('a')

        wrapper.setProps({
          options: [ {
            id: 'b',
            label: 'b',
            children: [],
          } ],
        })

        expect(vm.forest.nodeMap.a.label).toBe('a')
        expect(vm.forest.nodeMap.a.isFallbackNode).toBe(true)
      })
    })
  })

  describe('required', () => {
    let wrapper, input

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
          } ],
          searchable: true,
        },
      })
      input = findInput(wrapper)
    })

    describe('when required=true', () => {
      it('the input should have `required` attribute if having no value', () => {
        wrapper.setProps({ required: true })
        expect(input.attributes().required).toBe('required')
      })

      it('the input should not have `required` attribute if value is present', () => {
        wrapper.setProps({ value: 'a', required: true })
        expect(input.attributes()).not.toHaveMember('required')
      })
    })

    describe('when required=false', () => {
      it('the input should not have `required` attribute even if value is present', () => {
        wrapper.setProps({ value: 'a', required: false })
        expect(input.attributes()).not.toHaveMember('required')
      })
    })
  })

  describe('searchable', () => {
    describe('when searchable=true', () => {
      describe('when multiple=true', () => {
        it('should show input', () => {
          const wrapper = mount(Treeselect, {
            propsData: {
              multiple: true,
              searchable: true,
              options: [],
            },
          })

          expect(wrapper.contains('.vue-treeselect__input-container .vue-treeselect__input')).toBe(true)
        })

        it('should auto resize when length of input value changes', () => {
          // This is currently impossible since both PhantomJS and Headless Chrome
          // always return 0 for `clientWidth`, `offsetWidth` and etc.
        })
      })

      describe('when multiple=false', () => {
        it('should show input', () => {
          const wrapper = mount(Treeselect, {
            propsData: {
              multiple: false,
              searchable: true,
              options: [],
            },
          })

          expect(wrapper.contains('.vue-treeselect__input-container .vue-treeselect__input')).toBe(true)
        })
      })

      it('entering search query', async () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            searchable: true,
            options: [],
          },
        })
        const { vm } = wrapper

        expect(vm.localSearch.active).toBe(false)
        expect(vm.trigger.searchQuery).toBe('')

        await typeSearchText(wrapper, '$SEARCH_QUERY$')
        expect(vm.localSearch.active).toBe(true)
        expect(vm.trigger.searchQuery).toBe('$SEARCH_QUERY$')

        await typeSearchText(wrapper, '')
        expect(vm.localSearch.active).toBe(false)
        expect(vm.trigger.searchQuery).toBe('')
      })

      it('filtering', async () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            alwaysOpen: true,
            multiple: true,
            searchable: true,
            options: [ {
              id: 'a',
              label: 'a',
              children: [ {
                id: 'aa',
                label: 'aa',
              }, {
                id: 'ab',
                label: 'ab',
              } ],
            }, {
              id: 'b',
              label: 'b',
            } ],
          },
        })
        const { vm } = wrapper

        await vm.$nextTick()

        expect(vm.localSearch.noResults).toBe(true)

        await typeSearchText(wrapper, 'b')
        expect(vm.localSearch.noResults).toBe(false)

        const expectedMatchedNodeIds = [ 'ab', 'b' ]
        const options = wrapper.findAll(Option)
        expect(options.length).toBe(4)
        options.wrappers.forEach(option => {
          const { node } = option.vm
          expect(node.isMatched).toBe(expectedMatchedNodeIds.includes(node.id))
        })
      })
    })

    describe('when searchable=false', () => {
      describe('when multiple=true', () => {
        it('should not show input but a placeholder', () => {
          const wrapper = mount(Treeselect, {
            propsData: {
              multiple: true,
              searchable: false,
              options: [],
            },
          })

          expect(wrapper.contains('.vue-treeselect__input-container')).toBe(true)
          expect(wrapper.find('.vue-treeselect__input-container').isEmpty()).toBe(true)
        })
      })

      describe('when multiple=false', () => {
        it('should not show input but a placeholder', () => {
          const wrapper = mount(Treeselect, {
            propsData: {
              multiple: false,
              searchable: false,
              options: [],
            },
          })

          expect(wrapper.contains('.vue-treeselect__input-container')).toBe(true)
          expect(wrapper.find('.vue-treeselect__input-container').isEmpty()).toBe(true)
        })
      })
    })
  })

  it('showCount', () => {
    // TODO
  })

  describe('showCountOnSearch', () => {
    let wrapper

    beforeEach(async () => {
      wrapper = mount(Treeselect, {
        propsData: {
          alwaysOpen: true,
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
            }, {
              id: 'ab',
              label: 'ab',
            } ],
          }, {
            id: 'b',
            label: 'b',
            children: [ {
              id: 'ba',
              label: 'ba',
            }, {
              id: 'bb',
              label: 'bb',
            } ],
          } ],
          showCount: true,
        },
      })

      await wrapper.vm.$nextTick()
    })

    it('when showCountOnSearch=false', async () => {
      wrapper.setProps({ showCountOnSearch: false })

      await typeSearchText(wrapper, 'a')
      expect(wrapper.contains('.vue-treeselect__count')).toBe(false)
    })

    it('when showCountOnSearch=true', async () => {
      wrapper.setProps({ showCountOnSearch: true })

      await typeSearchText(wrapper, 'a')
      expect(wrapper.contains('.vue-treeselect__count')).toBe(true)
    })

    it('when showCountOnSearch not specified', async () => {
      await typeSearchText(wrapper, 'a')
      expect(wrapper.contains('.vue-treeselect__count')).toBe(true)
    })

    it('should refresh count number after search changes', async () => {
      wrapper.setProps({ showCountOnSearch: true })

      await typeSearchText(wrapper, 'a')
      expect(findOptionByNodeId(wrapper, 'a').find('.vue-treeselect__count').text()).toEqual('(2)')
      expect(findOptionByNodeId(wrapper, 'b').find('.vue-treeselect__count').text()).toEqual('(1)')

      await typeSearchText(wrapper, 'b')
      expect(findOptionByNodeId(wrapper, 'a').find('.vue-treeselect__count').text()).toEqual('(1)')
      expect(findOptionByNodeId(wrapper, 'b').find('.vue-treeselect__count').text()).toEqual('(2)')
    })
  })

  describe('sortValueBy', () => {
    let wrapper, vm

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          options: generateOptions(4),
          multiple: true,
          flat: true,
        },
      })
      vm = wrapper.vm
    })

    it('when sortValueBy="ORDER_SELECTED"', () => {
      wrapper.setProps({ sortValueBy: 'ORDER_SELECTED' })

      vm.select(vm.forest.nodeMap.bb)
      expect(vm.internalValue).toEqual([ 'bb' ])
      vm.select(vm.forest.nodeMap.a)
      expect(vm.internalValue).toEqual([ 'bb', 'a' ])
      vm.select(vm.forest.nodeMap.dddd)
      expect(vm.internalValue).toEqual([ 'bb', 'a', 'dddd' ])
      vm.select(vm.forest.nodeMap.ccc)
      expect(vm.internalValue).toEqual([ 'bb', 'a', 'dddd', 'ccc' ])
    })

    it('when sortValueBy="LEVEL"', () => {
      wrapper.setProps({ sortValueBy: 'LEVEL' })

      vm.select(vm.forest.nodeMap.bb)
      expect(vm.internalValue).toEqual([ 'bb' ])
      vm.select(vm.forest.nodeMap.aaa)
      expect(vm.internalValue).toEqual([ 'bb', 'aaa' ])
      vm.select(vm.forest.nodeMap.dddd)
      expect(vm.internalValue).toEqual([ 'bb', 'aaa', 'dddd' ])
      vm.select(vm.forest.nodeMap.c)
      expect(vm.internalValue).toEqual([ 'c', 'bb', 'aaa', 'dddd' ])
      vm.select(vm.forest.nodeMap.aa)
      expect(vm.internalValue).toEqual([ 'c', 'aa', 'bb', 'aaa', 'dddd' ])
    })

    it('when sortValueBy="INDEX"', () => {
      wrapper.setProps({ sortValueBy: 'INDEX' })

      vm.select(vm.forest.nodeMap.d)
      expect(vm.internalValue).toEqual([ 'd' ])
      vm.select(vm.forest.nodeMap.bbb)
      expect(vm.internalValue).toEqual([ 'bbb', 'd' ])
      vm.select(vm.forest.nodeMap.aaaa)
      expect(vm.internalValue).toEqual([ 'aaaa', 'bbb', 'd' ])
      vm.select(vm.forest.nodeMap.cc)
      expect(vm.internalValue).toEqual([ 'aaaa', 'bbb', 'cc', 'd' ])
    })

    it('should re-sort value after prop value changes', () => {
      wrapper.setProps({
        sortValueBy: 'ORDER_SELECTED',
        value: [ 'bb', 'c', 'aaa' ],
      })

      wrapper.setProps({ sortValueBy: 'INDEX' })
      expect(vm.internalValue).toEqual([ 'aaa', 'bb', 'c' ])
      wrapper.setProps({ sortValueBy: 'LEVEL' })
      expect(vm.internalValue).toEqual([ 'c', 'bb', 'aaa' ])
      wrapper.setProps({ sortValueBy: 'ORDER_SELECTED' })
      expect(vm.internalValue).toEqual([ 'bb', 'c', 'aaa' ])
    })

    it('more cases', () => {
      wrapper.setProps({
        sortValueBy: 'INDEX',
        value: [ 'aa', 'aaa' ],
      })
      expect(vm.internalValue).toEqual([ 'aa', 'aaa' ])

      wrapper.setProps({
        sortValueBy: 'INDEX',
        value: [ 'aaa', 'aa' ],
      })
      expect(vm.internalValue).toEqual([ 'aa', 'aaa' ])

      wrapper.setProps({
        sortValueBy: 'INDEX',
        value: [ 'aa', 'bb' ],
      })
      expect(vm.internalValue).toEqual([ 'aa', 'bb' ])

      wrapper.setProps({
        sortValueBy: 'INDEX',
        value: [ 'bb', 'aa' ],
      })
      expect(vm.internalValue).toEqual([ 'aa', 'bb' ])
    })
  })

  describe('tabIndex', () => {
    it('when disabled=false & searchable=true', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          searchable: true,
          disabled: false,
        },
      })
      const inputContainer = findInputContainer(wrapper)
      const input = findInput(wrapper)

      expect(inputContainer.attributes().tabindex).toBe(undefined)
      expect(input.attributes().tabindex).toBe('0')
    })

    it('when disabled=false & searchable=false', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          searchable: false,
          disabled: false,
        },
      })
      const inputContainer = findInputContainer(wrapper)

      expect(inputContainer.attributes().tabindex).toBe('0')
    })

    it('when disabled=true', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          disabled: true,
        },
      })
      const inputContainer = findInputContainer(wrapper)

      expect(inputContainer.attributes().tabindex).toBe(undefined)
    })

    it('customized value', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          searchable: true,
          disabled: false,
          tabIndex: 1,
        },
      })
      const input = findInput(wrapper)

      expect(input.attributes().tabindex).toBe('1')
    })
  })

  describe('valueConsistsOf', () => {
    let wrapper, vm

    describe('get internalValue', () => {
      beforeEach(() => {
        wrapper = mount(Treeselect, {
          propsData: {
            multiple: true,
            options: [ {
              id: 'a',
              label: 'a',
              children: [ {
                id: 'aa',
                label: 'aa',
                children: [ {
                  id: 'aaa',
                  label: 'aaa',
                }, {
                  id: 'aab',
                  label: 'aab',
                } ],
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
              }, {
                id: 'ac',
                label: 'ac',
              } ],
            }, {
              id: 'b',
              label: 'b',
              children: [],
            } ],
            value: [ 'aa' ],
          },
        })
        vm = wrapper.vm
      })

      it('when valueConsistsOf=ALL', () => {
        wrapper.setProps({ valueConsistsOf: ALL })

        expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab' ])
        vm.select(vm.forest.nodeMap.ab)
        expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab', 'ab', 'aba', 'abb' ])
        vm.select(vm.forest.nodeMap.b)
        expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab', 'ab', 'aba', 'abb', 'b' ])
        vm.select(vm.forest.nodeMap.ac)
        expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab', 'ab', 'aba', 'abb', 'b', 'ac', 'a' ])
      })

      it('when valueConsistsOf=BRANCH_PRIORITY', () => {
        wrapper.setProps({ valueConsistsOf: BRANCH_PRIORITY })

        expect(vm.internalValue).toEqual([ 'aa' ])
        vm.select(vm.forest.nodeMap.ab)
        expect(vm.internalValue).toEqual([ 'aa', 'ab' ])
        vm.select(vm.forest.nodeMap.b)
        expect(vm.internalValue).toEqual([ 'aa', 'ab', 'b' ])
        vm.select(vm.forest.nodeMap.ac)
        expect(vm.internalValue).toEqual([ 'b', 'a' ])
      })

      it('when valueConsistsOf=LEAF_PRIORITY', () => {
        wrapper.setProps({ valueConsistsOf: LEAF_PRIORITY })

        expect(vm.internalValue).toEqual([ 'aaa', 'aab' ])
        vm.select(vm.forest.nodeMap.ab)
        expect(vm.internalValue).toEqual([ 'aaa', 'aab', 'aba', 'abb' ])
        vm.select(vm.forest.nodeMap.b)
        expect(vm.internalValue).toEqual([ 'aaa', 'aab', 'aba', 'abb', 'b' ])
        vm.select(vm.forest.nodeMap.ac)
        expect(vm.internalValue).toEqual([ 'aaa', 'aab', 'aba', 'abb', 'b', 'ac' ])
      })

      it('when valueConsistsOf=ALL_WITH_INDETERMINATE', () => {
        wrapper.setProps({ valueConsistsOf: ALL_WITH_INDETERMINATE })

        expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab', 'a' ])
        vm.select(vm.forest.nodeMap.ab)
        expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab', 'ab', 'aba', 'abb', 'a' ])
        vm.select(vm.forest.nodeMap.b)
        expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab', 'ab', 'aba', 'abb', 'b', 'a' ])
        vm.select(vm.forest.nodeMap.ac)
        expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab', 'ab', 'aba', 'abb', 'b', 'ac', 'a' ])
      })
    })

    describe('set value', () => {
      beforeEach(() => {
        wrapper = mount(Treeselect, {
          propsData: {
            options: [ {
              id: 'a',
              label: 'a',
              children: [ {
                id: 'aa',
                label: 'aa',
                children: [ {
                  id: 'aaa',
                  label: 'aaa',
                }, {
                  id: 'aab',
                  label: 'aab',
                } ],
              }, {
                id: 'ab',
                label: 'ab',
              } ],
            }, {
              id: 'b',
              label: 'b',
            }, {
              id: 'c',
              label: 'c',
              children: [],
            } ],
          },
        })
        vm = wrapper.vm
      })

      describe('when multiple=false', () => {
        const types = [ ALL, BRANCH_PRIORITY, LEAF_PRIORITY, ALL_WITH_INDETERMINATE ]
        types.forEach(type => {
          it(`when valueConsistsOf=${type}`, () => {
            wrapper.setProps({ multiple: false })

            const values = [ 'aaa', 'aa', 'ab', 'a', 'b', 'c' ]
            values.forEach(value => {
              wrapper.setProps({ value })
              expect(vm.internalValue).toEqual([ value ])
              expect(vm.forest.selectedNodeIds).toEqual([ value ])
            })
          })
        })
      })

      describe('when multiple=true', () => {
        beforeEach(() => {
          wrapper.setProps({ multiple: true })
        })

        it('when valueConsistsOf=ALL', () => {
          wrapper.setProps({ valueConsistsOf: ALL })

          wrapper.setProps({ value: [] })
          expect(vm.internalValue).toEqual([])
          expect(vm.forest.selectedNodeIds).toEqual([])
          expect(vm.forest.checkedStateMap).toEqual({
            a: UNCHECKED,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'ab' ] })
          expect(vm.internalValue).toEqual([ 'ab' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'ab' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: CHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'aa', 'aaa', 'aab' ] })
          expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'aa', 'aaa', 'aab' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: CHECKED,
            aaa: CHECKED,
            aab: CHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'b', 'aa', 'aaa', 'aab', 'a', 'ab' ] })
          expect(vm.internalValue).toEqual([ 'b', 'aa', 'aaa', 'aab', 'a', 'ab' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'b', 'aa', 'aaa', 'aab', 'a', 'ab' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: CHECKED,
            aa: CHECKED,
            aaa: CHECKED,
            aab: CHECKED,
            ab: CHECKED,
            b: CHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'c' ] })
          expect(vm.internalValue).toEqual([ 'c' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'c' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: UNCHECKED,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: CHECKED,
          })
        })

        it('when valueConsistsOf=BRANCH_PRIORITY', () => {
          wrapper.setProps({ valueConsistsOf: BRANCH_PRIORITY })

          wrapper.setProps({ value: [] })
          expect(vm.internalValue).toEqual([])
          expect(vm.forest.selectedNodeIds).toEqual([])
          expect(vm.forest.checkedStateMap).toEqual({
            a: UNCHECKED,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'ab' ] })
          expect(vm.internalValue).toEqual([ 'ab' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'ab' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: CHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'aaa' ] })
          expect(vm.internalValue).toEqual([ 'aaa' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'aaa' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: INDETERMINATE,
            aaa: CHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'aa' ] })
          expect(vm.internalValue).toEqual([ 'aa' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'aa', 'aaa', 'aab' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: CHECKED,
            aaa: CHECKED,
            aab: CHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'a' ] })
          expect(vm.internalValue).toEqual([ 'a' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'a', 'aa', 'ab', 'aaa', 'aab' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: CHECKED,
            aa: CHECKED,
            aaa: CHECKED,
            aab: CHECKED,
            ab: CHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'aaa', 'ab', 'b' ] })
          expect(vm.internalValue).toEqual([ 'aaa', 'ab', 'b' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'aaa', 'ab', 'b' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: INDETERMINATE,
            aaa: CHECKED,
            aab: UNCHECKED,
            ab: CHECKED,
            b: CHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'b', 'aa' ] })
          expect(vm.internalValue).toEqual([ 'b', 'aa' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'b', 'aa', 'aaa', 'aab' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: CHECKED,
            aaa: CHECKED,
            aab: CHECKED,
            ab: UNCHECKED,
            b: CHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'b', 'aab' ] })
          expect(vm.internalValue).toEqual([ 'b', 'aab' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'b', 'aab' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: INDETERMINATE,
            aaa: UNCHECKED,
            aab: CHECKED,
            ab: UNCHECKED,
            b: CHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'c' ] })
          expect(vm.internalValue).toEqual([ 'c' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'c' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: UNCHECKED,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: CHECKED,
          })
        })

        it('when valueConsistsOf=LEAF_PRIORITY', () => {
          wrapper.setProps({ valueConsistsOf: LEAF_PRIORITY })

          wrapper.setProps({ value: [] })
          expect(vm.internalValue).toEqual([])
          expect(vm.forest.selectedNodeIds).toEqual([])
          expect(vm.forest.checkedStateMap).toEqual({
            a: UNCHECKED,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'ab' ] })
          expect(vm.internalValue).toEqual([ 'ab' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'ab' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: CHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'aab' ] })
          expect(vm.internalValue).toEqual([ 'aab' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'aab' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: INDETERMINATE,
            aaa: UNCHECKED,
            aab: CHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'aab', 'aaa' ] })
          expect(vm.internalValue).toEqual([ 'aab', 'aaa' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'aab', 'aaa', 'aa' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: CHECKED,
            aaa: CHECKED,
            aab: CHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'aaa', 'ab', 'aab' ] })
          expect(vm.internalValue).toEqual([ 'aaa', 'ab', 'aab' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'aaa', 'ab', 'aab', 'aa', 'a' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: CHECKED,
            aa: CHECKED,
            aaa: CHECKED,
            aab: CHECKED,
            ab: CHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'c' ] })
          expect(vm.internalValue).toEqual([ 'c' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'c' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: UNCHECKED,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: CHECKED,
          })
        })

        it('when valueConsistsOf=ALL_WITH_INDETERMINATE', () => {
          wrapper.setProps({ valueConsistsOf: ALL_WITH_INDETERMINATE })

          wrapper.setProps({ value: [] })
          expect(vm.internalValue).toEqual([])
          expect(vm.forest.selectedNodeIds).toEqual([])
          expect(vm.forest.checkedStateMap).toEqual({
            a: UNCHECKED,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'ab' ] })
          expect(vm.internalValue).toEqual([ 'ab', 'a' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'ab' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: CHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'aa', 'aaa', 'a' ] })
          expect(vm.internalValue).toEqual([ 'aaa', 'aa', 'a' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'aaa' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: INDETERMINATE,
            aaa: CHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'a', 'aa', 'aaa', 'aab' ] })
          expect(vm.internalValue).toEqual([ 'aaa', 'aab', 'aa', 'a' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'aaa', 'aab', 'aa' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: CHECKED,
            aaa: CHECKED,
            aab: CHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED,
          })

          wrapper.setProps({ value: [ 'c' ] })
          expect(vm.internalValue).toEqual([ 'c' ])
          expect(vm.forest.selectedNodeIds).toEqual([ 'c' ])
          expect(vm.forest.checkedStateMap).toEqual({
            a: UNCHECKED,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: CHECKED,
          })
        })
      })
    })
  })

  describe('valueFormat', () => {
    describe('when valueFormat=id', () => {
      it('single-select', async () => {
        const vm = new Vue({
          components: { Treeselect },
          data: {
            value: 'a',
            options: [ {
              id: 'a',
              label: 'a',
            }, {
              id: 'b',
              label: 'b',
            } ],
          },
          template: `
            <div>
              <treeselect
                v-model="value"
                :options="options"
                value-format="id"
              />
            </div>
          `,
        }).$mount()
        const comp = vm.$children[0]

        expect(comp.forest.selectedNodeIds).toEqual([ 'a' ])

        comp.select(comp.forest.nodeMap.b)
        await comp.$nextTick()
        expect(comp.forest.selectedNodeIds).toEqual([ 'b' ])
        expect(vm.value).toEqual('b')
      })

      it('multi-select', async () => {
        const vm = new Vue({
          components: { Treeselect },
          data: {
            value: [ 'a' ],
            options: [ {
              id: 'a',
              label: 'a',
            }, {
              id: 'b',
              label: 'b',
            } ],
          },
          template: `
            <div>
              <treeselect
                v-model="value"
                :options="options"
                :multiple="true"
                value-format="id"
              />
            </div>
          `,
        }).$mount()
        const comp = vm.$children[0]

        expect(comp.forest.selectedNodeIds).toEqual([ 'a' ])

        comp.select(comp.forest.nodeMap.b)
        await comp.$nextTick()
        expect(comp.forest.selectedNodeIds).toEqual([ 'a', 'b' ])
        expect(vm.value).toEqual([ 'a', 'b' ])
      })
    })

    describe('when valueFormat=object', () => {
      it('single-select', async () => {
        const vm = new Vue({
          components: { Treeselect },
          data: {
            value: {
              id: 'a',
              label: 'a',
            },
            options: [ {
              id: 'a',
              label: 'a',
            }, {
              id: 'b',
              label: 'b',
            } ],
          },
          template: `
            <div>
              <treeselect
                v-model="value"
                :options="options"
                value-format="object"
              />
            </div>
          `,
        }).$mount()
        const comp = vm.$children[0]

        expect(comp.forest.selectedNodeIds).toEqual([ 'a' ])

        comp.select(comp.forest.nodeMap.b)
        await comp.$nextTick()
        expect(comp.forest.selectedNodeIds).toEqual([ 'b' ])
        expect(vm.value).toEqual({
          id: 'b',
          label: 'b',
        })
      })

      it('multi-select', async () => {
        const vm = new Vue({
          components: { Treeselect },
          data: {
            value: [ {
              id: 'a',
              label: 'a',
            } ],
            options: [ {
              id: 'a',
              label: 'a',
            }, {
              id: 'b',
              label: 'b',
            } ],
          },
          template: `
            <div>
              <treeselect
                v-model="value"
                :options="options"
                :multiple="true"
                value-format="object"
              />
            </div>
          `,
        }).$mount()
        const comp = vm.$children[0]

        expect(comp.forest.selectedNodeIds).toEqual([ 'a' ])

        comp.select(comp.forest.nodeMap.b)
        await comp.$nextTick()
        expect(comp.forest.selectedNodeIds).toEqual([ 'a', 'b' ])
        expect(vm.value).toEqual([ {
          id: 'a',
          label: 'a',
        }, {
          id: 'b',
          label: 'b',
        } ])
      })

      it('should return raw node object', async () => {
        const vm = new Vue({
          components: { Treeselect },
          data: {
            value: {
              id: 'a',
              label: 'a',
            },
            options: [ {
              id: 'a',
              label: 'a',
              _extra: 'a',
            }, {
              id: 'b',
              label: 'b',
              _extra: 'b',
            } ],
          },
          template: `
            <div>
              <treeselect
                v-model="value"
                :options="options"
                value-format="object"
              />
            </div>
          `,
        }).$mount()
        const comp = vm.$children[0]

        expect(comp.forest.selectedNodeIds).toEqual([ 'a' ])

        comp.select(comp.forest.nodeMap.b)
        await comp.$nextTick()
        expect(vm.value).toEqual({
          id: 'b',
          label: 'b',
          _extra: 'b',
        })
      })
    })
  })

  it('zIndex', async () => {
    const wrapper = mount(Treeselect, {
      sync: false,
      propsData: {
        zIndex: 1,
        options: [],
      },
      attachToDocument: true,
    })
    const { vm } = wrapper

    vm.openMenu()
    await vm.$nextTick()

    const menuContainer = findMenuContainer(wrapper)

    expect(menuContainer.element.style.zIndex).toBe('1')

    wrapper.setProps({ zIndex: 2 })
    await vm.$nextTick()

    expect(menuContainer.element.style.zIndex).toBe('2')
  })
})
