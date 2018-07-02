import { mount } from '@vue/test-utils'
import Treeselect from '@src/components/Treeselect'
import { typeSearchText, findOptionArrowByNodeId } from './shared'

describe('Searching', () => {
  describe('basic', () => {
    it('exactly matching', async () => {
      const wrapper = mount(Treeselect, {
        propsData: {
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

      await typeSearchText(wrapper, 'a')
      expect(vm.forest.nodeMap.a.isMatched).toBe(true)
      expect(vm.forest.nodeMap.a.isExpandedOnSearch).toBe(true)
      expect(vm.forest.nodeMap.aa.isMatched).toBe(true)
      expect(vm.forest.nodeMap.ab.isMatched).toBe(true)
      expect(vm.forest.nodeMap.b.isMatched).toBe(false)

      await typeSearchText(wrapper, 'b')
      expect(vm.forest.nodeMap.a.isMatched).toBe(false)
      expect(vm.forest.nodeMap.a.isExpandedOnSearch).toBe(true)
      expect(vm.forest.nodeMap.aa.isMatched).toBe(false)
      expect(vm.forest.nodeMap.ab.isMatched).toBe(true)
      expect(vm.forest.nodeMap.b.isMatched).toBe(true)
    })

    it('should be case insensitive', async () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          searchable: true,
          options: [ {
            id: 'a',
            label: 'James Blunt',
          }, {
            id: 'b',
            label: 'Cheer Chen',
          } ],
        },
      })
      const { vm } = wrapper

      await typeSearchText(wrapper, 'james')
      expect(vm.forest.nodeMap.a.isMatched).toBe(true)
      expect(vm.forest.nodeMap.b.isMatched).toBe(false)

      await typeSearchText(wrapper, 'chen')
      expect(vm.forest.nodeMap.a.isMatched).toBe(false)
      expect(vm.forest.nodeMap.b.isMatched).toBe(true)
    })

    it('toggle expanded', async () => {
      function expectArrowToBeRotatedOrNot(expected) {
        const optionArrow = findOptionArrowByNodeId(wrapper, 'a')
        const isRotated = optionArrow.classes().includes('vue-treeselect__option-arrow--rotated')
        expect(isRotated).toBe(expected)
      }

      const wrapper = mount(Treeselect, {
        propsData: {
          searchable: true,
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

      vm.openMenu()

      // not rotated by default
      expectArrowToBeRotatedOrNot(false)

      // enter keyword and search
      await typeSearchText(wrapper, 'a')
      expectArrowToBeRotatedOrNot(true)

      // clear keyword and exit search mode
      await typeSearchText(wrapper, '')
      // should recover state
      expectArrowToBeRotatedOrNot(false)

      // manually toggle
      vm.toggleExpanded(vm.forest.nodeMap.a)
      await vm.$nextTick()
      expectArrowToBeRotatedOrNot(true)

      // search again
      await typeSearchText(wrapper, 'a')
      expectArrowToBeRotatedOrNot(true)

      // manually toggle
      vm.toggleExpanded(vm.forest.nodeMap.a)
      await vm.$nextTick()
      expectArrowToBeRotatedOrNot(false)

      // exit search mode again
      await typeSearchText(wrapper, '')
      // should recover state
      expectArrowToBeRotatedOrNot(true)

      // search again
      await typeSearchText(wrapper, 'a')
      expectArrowToBeRotatedOrNot(true)
    })

    describe('matching branch nodes', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          searchable: true,
          options: [ {
            id: 'branch',
            label: 'branch',
            children: [ {
              id: 'aa',
              label: 'aa',
            }, {
              id: 'ab',
              label: 'ab',
            }, {
              id: 'ac',
              label: 'ac',
              children: [ {
                id: 'aca',
                label: 'aca',
              } ],
            } ],
          } ],
        },
      })
      const { vm } = wrapper

      it('preparation', () => {
        vm.openMenu()
        expect(vm.menu.isOpen).toBe(true)
      })

      it('if no children are matched, the branch node should be collapsed', async () => {
        await typeSearchText(wrapper, 'branch')
        expect(vm.forest.nodeMap.branch.isMatched).toBe(true)
        expect(vm.forest.nodeMap.branch.isExpandedOnSearch).toBe(false)
        expect(vm.forest.nodeMap.aa.isMatched).toBe(false)
        expect(vm.forest.nodeMap.ab.isMatched).toBe(false)
        expect(vm.forest.nodeMap.ac.isMatched).toBe(false)
        expect(vm.forest.nodeMap.aca.isMatched).toBe(false)
      })

      it('expand a branch node should show all its children', async () => {
        expect(vm.menu.isOpen).toBe(true)
        vm.toggleExpanded(vm.forest.nodeMap.branch)
        expect(vm.forest.nodeMap.branch.isExpandedOnSearch).toBe(true)
        await vm.$nextTick()
        expect(wrapper.contains('.vue-treeselect__option[data-id="aa"]')).toBe(true)
        expect(wrapper.contains('.vue-treeselect__option[data-id="ab"]')).toBe(true)
        expect(wrapper.contains('.vue-treeselect__option[data-id="ac"]')).toBe(true)
        expect(vm.forest.nodeMap.ac.isExpandedOnSearch).toBe(false)
        vm.toggleExpanded(vm.forest.nodeMap.ac)
        await vm.$nextTick()
        expect(wrapper.contains('.vue-treeselect__option[data-id="aca"]')).toBe(true)
      })
    })

    it('should highlight first option after search query changes', async () => {
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
            } ],
          } ],
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()

      expect(vm.menu.current).toBe('a')

      await typeSearchText(wrapper, 'b')
      expect(vm.menu.current).toBe('b')

      await typeSearchText(wrapper, 'a')
      expect(vm.menu.current).toBe('a')

      await typeSearchText(wrapper, 'bb')
      expect(vm.menu.current).toBe('b')

      await typeSearchText(wrapper, '')
      expect(vm.menu.current).toBe('a')
    })
  })

  describe('fuzzy search', () => {
    it('fuzzy matching', () => {
      // TODO
    })

    it('should be case insensitive', async () => {
      // TODO
    })
  })

  describe('nested search', () => {
    it('when searchNested=false', async () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          searchable: true,
          searchNested: false,
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'x',
            }, {
              id: 'ab',
              label: 'a x',
            } ],
          } ],
        },
      })
      const { vm } = wrapper

      await typeSearchText(wrapper, 'a x')
      expect(vm.forest.nodeMap.aa.isMatched).toBe(false)
      expect(vm.forest.nodeMap.ab.isMatched).toBe(true)
    })

    describe('when searchNested=true', () => {
      let wrapper, vm

      beforeEach(() => {
        wrapper = mount(Treeselect, {
          propsData: {
            searchable: true,
            searchNested: true,
            disableFuzzyMatching: false,
            options: [ {
              id: 'a',
              label: 'abc',
              children: [ {
                id: 'aa',
                label: 'xyz',
              } ],
            } ],
          },
        })
        vm = wrapper.vm
      })

      it('should also search ancestor nodes', async () => {
        await typeSearchText(wrapper, 'ab yz')
        expect(vm.forest.nodeMap.aa.isMatched).toBe(true)
      })

      it('should disable fuzzy search', async () => {
        await typeSearchText(wrapper, 'ac yz')
        expect(vm.forest.nodeMap.aa.isMatched).toBe(false)
      })

      it('when search query not contains whitespaces, search in a normal manner', async () => {
        await typeSearchText(wrapper, 'xz') // fuzzy search
        expect(vm.forest.nodeMap.aa.isMatched).toBe(true)
      })

      it('should be case insensitive', async () => {
        // TODO
      })
    })
  })

  describe('match more properties', () => {
    async function typeAndAssert(wrapper, searchText, idListOfNodesThatShouldBeMatched) {
      await typeSearchText(wrapper, searchText)
      const { nodeMap } = wrapper.vm.forest
      expect(nodeMap).toEqual(Object.keys(nodeMap).reduce((prev, id) => ({
        ...prev,
        [id]: jasmine.objectContaining({ isMatched: idListOfNodesThatShouldBeMatched.includes(id) }),
      }), {}))
    }

    it('match more properties than only `label`', async () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          matchKeys: [ 'label', 'value' ],
          searchable: true,
          options: [ {
            id: 'a',
            label: 'a',
            value: '1',
            extra: 'x',
          }, {
            id: 'b',
            label: 'b',
            value: '2',
            extra: 'y',
          } ],
        },
      })

      await typeAndAssert(wrapper, 'a', [ 'a' ])
      await typeAndAssert(wrapper, 'b', [ 'b' ])
      await typeAndAssert(wrapper, '1', [ 'a' ])
      await typeAndAssert(wrapper, '2', [ 'b' ])
      await typeAndAssert(wrapper, 'x', [])
      await typeAndAssert(wrapper, 'y', [])
    })

    it('should properly handle value of types other than string', async () => {
      const specialValues = [
        1, NaN,
        null, undefined,
        {}, [],
        () => { /* empty */ },
      ]
      const wrapper = mount(Treeselect, {
        propsData: {
          matchKeys: [ 'value' ],
          searchable: true,
          options: specialValues.map((value, index) => ({
            id: String(index),
            label: String(index),
            value,
          })),
        },
      })

      await typeAndAssert(wrapper, '1', [ '0' ])
      await typeAndAssert(wrapper, 'NaN', [])
      await typeAndAssert(wrapper, 'null', [])
      await typeAndAssert(wrapper, 'undefined', [])
      await typeAndAssert(wrapper, 'object', [])
      await typeAndAssert(wrapper, '{}', [])
      await typeAndAssert(wrapper, '[]', [])
      await typeAndAssert(wrapper, 'function', [])
    })

    it('with `normalizer` prop', async () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          // here we leave the `matchKeys` prop to its default value `[ 'label' ]`
          searchable: true,
          normalizer: node => ({
            id: node.key,
            label: node.name,
          }),
          options: [ {
            key: 'a',
            name: 'a',
          }, {
            key: 'b',
            name: 'b',
          } ],
        },
      })

      await typeAndAssert(wrapper, 'a', [ 'a' ])
      await typeAndAssert(wrapper, 'b', [ 'b' ])
    })

    it('should reinitialize options after the value of `matchKeys` prop changes', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          searchable: true,
          matchKeys: [ 'label' ],
          options: [ {
            id: 'A',
            label: 'x',
          }, {
            id: 'b',
            label: 'Y',
          } ],
        },
      })
      const { vm } = wrapper

      expect(vm.forest.nodeMap).toEqual({
        A: jasmine.objectContaining({
          lowerCased: { label: 'x' },
        }),
        b: jasmine.objectContaining({
          lowerCased: { label: 'y' },
        }),
      })

      wrapper.setProps({ matchKeys: [ 'id' ] })
      expect(vm.forest.nodeMap).toEqual({
        A: jasmine.objectContaining({
          lowerCased: { id: 'a' },
        }),
        b: jasmine.objectContaining({
          lowerCased: { id: 'b' },
        }),
      })
    })
  })
})
