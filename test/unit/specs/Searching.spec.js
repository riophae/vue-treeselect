import { mount } from '@vue/test-utils'
import Treeselect from '@riophae/vue-treeselect/components/Treeselect'
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
        vm.toggleExpanded(vm.forest.nodeMap.branch)
        await vm.$nextTick()
        expect(vm.menu.isOpen).toBe(true)
        expect(vm.forest.nodeMap.branch.isExpandedOnSearch).toBe(true)
        expect(wrapper.contains('.vue-treeselect__option[data-id="aa"]')).toBe(true)
        expect(wrapper.contains('.vue-treeselect__option[data-id="ab"]')).toBe(true)
        expect(wrapper.contains('.vue-treeselect__option[data-id="ac"]')).toBe(true)
        expect(vm.forest.nodeMap.ac.isExpandedOnSearch).toBe(false)
        vm.toggleExpanded(vm.forest.nodeMap.ac)
        await vm.$nextTick()
        expect(wrapper.contains('.vue-treeselect__option[data-id="aca"]')).toBe(true)
      })
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
})
