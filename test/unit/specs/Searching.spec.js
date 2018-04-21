import { mount } from '@vue/test-utils'
import Treeselect from '@riophae/vue-treeselect/components/Treeselect'
import { typeSearchText } from './shared'

describe('Searching', () => {
  describe('fuzzy search', () => {
    it('fuzzy matching', () => {
      // TODO
    })

    it('should ignore case', () => {
      // TODO
    })
  })

  describe('nested search', () => {
    it('when searchNested=false', async () => {
      const wrapper = mount(Treeselect, {
        propsData: {
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
      expect(vm.nodeMap.aa.isMatched).toBe(false)
      expect(vm.nodeMap.ab.isMatched).toBe(true)
    })

    describe('when searchNested=true', () => {
      let wrapper, vm

      beforeEach(() => {
        wrapper = mount(Treeselect, {
          propsData: {
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
        expect(vm.nodeMap.aa.isMatched).toBe(true)
      })

      it('should disable fuzzy search', async () => {
        await typeSearchText(wrapper, 'ac yz')
        expect(vm.nodeMap.aa.isMatched).toBe(false)
      })

      it('when search query not contains whitespaces, search in a normal manner', async () => {
        await typeSearchText(wrapper, 'xz') // fuzzy search
        expect(vm.nodeMap.aa.isMatched).toBe(true)
      })

      it('should ignore case', () => {
        // TODO
      })
    })
  })
})
