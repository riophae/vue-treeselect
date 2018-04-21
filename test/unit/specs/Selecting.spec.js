import { mount } from '@vue/test-utils'
import Treeselect from '@riophae/vue-treeselect/components/Treeselect'
import { UNCHECKED, INDETERMINATE, CHECKED } from '@riophae/vue-treeselect/constants'
import { leftClick, findOptionByNodeId } from './shared'

describe('Single-select', () => {
  it('basic', () => {
    const wrapper = mount(Treeselect, {
      propsData: {
        multiple: false,
        options: [ {
          id: 'a',
          label: 'a',
          children: [ {
            id: 'aa',
            label: 'aa',
          }, {
            id: 'ab',
            label: 'ab',
          }, {
            id: 'ac',
            label: 'ac',
          } ],
        }, {
          id: 'b',
          label: 'b',
        } ],
      },
    })
    const { vm } = wrapper
    const { a, aa } = vm.nodeMap

    expect(vm.selectedNodeIds).toBeEmptyArray()
    vm.select(a) // select one
    expect(vm.selectedNodeIds).toEqual([ 'a' ])
    expect(vm.selectedNodeMap).toEqual({ a: true })
    vm.select(aa) // select another
    expect(vm.selectedNodeIds).toEqual([ 'aa' ])
    expect(vm.selectedNodeMap).toEqual({ aa: true })
    vm.select(aa) // select again
    expect(vm.selectedNodeIds).toEqual([ 'aa' ])
    expect(vm.selectedNodeMap).toEqual({ aa: true })
  })

  it('should blur the input after selecting an option when closeOnSelect=true & searchable=true', () => {
    const wrapper = mount(Treeselect, {
      attachToDocument: true,
      propsData: {
        options: [ {
          id: 'a',
          label: 'a',
        } ],
        multiple: false,
        searchable: true,
        closeOnSelect: true,
      },
      data: {
        isOpen: true,
      },
    })
    const { vm } = wrapper
    const labelWrapper = findOptionByNodeId(wrapper, 'a').find('.vue-treeselect__label-wrapper')

    leftClick(labelWrapper)
    expect(vm.selectedNodeIds).toEqual([ 'a' ])
    expect(vm.isFocused).toEqual(false)
    expect(vm.isOpen).toEqual(false)
  })
})

describe('Multi-select', () => {
  let wrapper, vm

  beforeEach(() => {
    wrapper = mount(Treeselect, {
      propsData: {
        multiple: true,
        sortValueBy: 'ORDER_SELECTED',
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
        } ],
      },
    })
    vm = wrapper.vm
  })

  it('case #1', () => {
    // current:
    //   [ ] a <- select
    //    |--[ ] aa
    //    |   |--[ ] aaa
    //    |   |--[ ] aab
    //    |--[ ] ab
    //   [ ] b
    // expected result:
    //   [v] a
    //    |--[v] aa
    //    |   |--[v] aaa
    //    |   |--[v] aab
    //    |--[v] ab
    //   [ ] b
    vm.select(vm.nodeMap.a)
    expect(vm.selectedNodeIds).toEqual([ 'a', 'aa', 'ab', 'aaa', 'aab' ])
    expect(vm.selectedNodeMap).toEqual({
      a: true,
      aa: true,
      ab: true,
      aaa: true,
      aab: true,
    })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: CHECKED,
      aa: CHECKED,
      aaa: CHECKED,
      aab: CHECKED,
      ab: CHECKED,
      b: UNCHECKED,
    })

    // current:
    //   [v] a
    //    |--[v] aa <- deselect
    //    |   |--[v] aaa
    //    |   |--[v] aab
    //    |--[v] ab
    //   [ ] b
    // expected result:
    //   [-] a
    //    |--[ ] aa
    //    |   |--[ ] aaa
    //    |   |--[ ] aab
    //    |--[v] ab
    //   [ ] b
    vm.select(vm.nodeMap.aa)
    expect(vm.selectedNodeIds).toEqual([ 'ab' ])
    expect(vm.selectedNodeMap).toEqual({ ab: true })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: INDETERMINATE,
      aa: UNCHECKED,
      aaa: UNCHECKED,
      aab: UNCHECKED,
      ab: CHECKED,
      b: UNCHECKED,
    })

    // current:
    //   [-] a
    //    |--[ ] aa
    //    |   |--[ ] aaa
    //    |   |--[ ] aab
    //    |--[v] ab
    //   [ ] b <- select
    // expected result:
    //   [-] a
    //    |--[ ] aa
    //    |   |--[ ] aaa
    //    |   |--[ ] aab
    //    |--[v] ab
    //   [v] b
    vm.select(vm.nodeMap.b)
    expect(vm.selectedNodeIds).toEqual([ 'ab', 'b' ])
    expect(vm.selectedNodeMap).toEqual({ ab: true, b: true })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: INDETERMINATE,
      aa: UNCHECKED,
      aaa: UNCHECKED,
      aab: UNCHECKED,
      ab: CHECKED,
      b: CHECKED,
    })

    // current:
    //   [-] a
    //    |--[ ] aa <- select again
    //    |   |--[ ] aaa
    //    |   |--[ ] aab
    //    |--[v] ab
    //   [v] b
    // expected result:
    //   [v] a
    //    |--[v] aa
    //    |   |--[v] aaa
    //    |   |--[v] aab
    //    |--[v] ab
    //   [v] b
    vm.select(vm.nodeMap.aa)
    expect(vm.selectedNodeIds).toEqual([ 'ab', 'b', 'aa', 'aaa', 'aab', 'a' ]) // a should be after b
    expect(vm.selectedNodeMap).toEqual({
      a: true,
      aa: true,
      aaa: true,
      aab: true,
      ab: true,
      b: true,
    })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: CHECKED,
      aa: CHECKED,
      aaa: CHECKED,
      aab: CHECKED,
      ab: CHECKED,
      b: CHECKED,
    })

    // current:
    //   [v] a <- deselect
    //    |--[v] aa
    //    |   |--[v] aaa
    //    |   |--[v] aab
    //    |--[v] ab
    //   [v] b
    // expected result:
    //   [ ] a
    //    |--[ ] aa
    //    |   |--[ ] aaa
    //    |   |--[ ] aab
    //    |--[ ] ab
    //   [v] b
    vm.select(vm.nodeMap.a)
    expect(vm.selectedNodeIds).toEqual([ 'b' ])
    expect(vm.selectedNodeMap).toEqual({ b: true })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: UNCHECKED,
      aa: UNCHECKED,
      aaa: UNCHECKED,
      aab: UNCHECKED,
      ab: UNCHECKED,
      b: CHECKED,
    })

    // current:
    //   [ ] a
    //    |--[ ] aa <- select
    //    |   |--[ ] aaa
    //    |   |--[ ] aab
    //    |--[ ] ab
    //   [v] b
    // expected result:
    //   [-] a
    //    |--[v] aa
    //    |   |--[v] aaa
    //    |   |--[v] aab
    //    |--[ ] ab
    //   [v] b
    vm.select(vm.nodeMap.aa)
    expect(vm.selectedNodeIds).toEqual([ 'b', 'aa', 'aaa', 'aab' ])
    expect(vm.selectedNodeMap).toEqual({
      aa: true,
      aaa: true,
      aab: true,
      b: true,
    })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: INDETERMINATE,
      aa: CHECKED,
      aaa: CHECKED,
      aab: CHECKED,
      ab: UNCHECKED,
      b: CHECKED,
    })

    // current:
    //   [ ] a
    //    |--[v] aa <- deselect
    //    |   |--[v] aaa
    //    |   |--[v] aab
    //    |--[ ] ab
    //   [v] b
    // expected result:
    //   [ ] a
    //    |--[ ] aa
    //    |   |--[ ] aaa
    //    |   |--[ ] aab
    //    |--[ ] ab
    //   [v] b
    vm.select(vm.nodeMap.aa)
    expect(vm.selectedNodeIds).toEqual([ 'b' ])
    expect(vm.selectedNodeMap).toEqual({ b: true })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: UNCHECKED,
      aa: UNCHECKED,
      aaa: UNCHECKED,
      aab: UNCHECKED,
      ab: UNCHECKED,
      b: CHECKED,
    })
  })

  it('case #2', () => {
    // current:
    //   [ ] a <- select
    //    |--[ ] aa
    //    |   |--[ ] aaa
    //    |   |--[ ] aab
    //    |--[ ] ab
    //   [ ] b
    // expected result:
    //   [v] a
    //    |--[v] aa
    //    |   |--[v] aaa
    //    |   |--[v] aab
    //    |--[v] ab
    //   [ ] b
    vm.select(vm.nodeMap.a)
    expect(vm.selectedNodeIds).toEqual([ 'a', 'aa', 'ab', 'aaa', 'aab' ])
    expect(vm.selectedNodeMap).toEqual({
      a: true,
      aa: true,
      ab: true,
      aaa: true,
      aab: true,
    })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: CHECKED,
      aa: CHECKED,
      aaa: CHECKED,
      aab: CHECKED,
      ab: CHECKED,
      b: UNCHECKED,
    })

    // current:
    //   [v] a
    //    |--[v] aa
    //    |   |--[v] aaa
    //    |   |--[v] aab
    //    |--[v] ab
    //   [ ] b <- select
    // expected result:
    //   [v] a
    //    |--[v] aa
    //    |   |--[v] aaa
    //    |   |--[v] aab
    //    |--[v] ab
    //   [v] b
    vm.select(vm.nodeMap.b)
    expect(vm.selectedNodeIds).toEqual([ 'a', 'aa', 'ab', 'aaa', 'aab', 'b' ])
    expect(vm.selectedNodeMap).toEqual({
      a: true,
      aa: true,
      ab: true,
      aaa: true,
      aab: true,
      b: true,
    })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: CHECKED,
      aa: CHECKED,
      aaa: CHECKED,
      aab: CHECKED,
      ab: CHECKED,
      b: CHECKED,
    })

    // current:
    //   [v] a
    //    |--[v] aa
    //    |   |--[v] aaa <- deselect
    //    |   |--[v] aab
    //    |--[v] ab
    //   [v] b
    // expected result:
    //   [-] a
    //    |--[-] aa
    //    |   |--[ ] aaa
    //    |   |--[v] aab
    //    |--[v] ab
    //   [v] b
    vm.select(vm.nodeMap.aaa)
    expect(vm.selectedNodeIds).toEqual([ 'ab', 'aab', 'b' ]) // keep order
    expect(vm.selectedNodeMap).toEqual({ aab: true, ab: true, b: true })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: INDETERMINATE,
      aa: INDETERMINATE,
      aaa: UNCHECKED,
      aab: CHECKED,
      ab: CHECKED,
      b: CHECKED,
    })

    // current:
    //   [-] a
    //    |--[-] aa
    //    |   |--[ ] aaa <- select again
    //    |   |--[v] aab
    //    |--[v] ab
    //   [v] b
    // expected result:
    //   [v] a
    //    |--[v] aa
    //    |   |--[v] aaa
    //    |   |--[v] aab
    //    |--[v] ab
    //   [v] b
    vm.select(vm.nodeMap.aaa)
    expect(vm.selectedNodeIds).toEqual([ 'ab', 'aab', 'b', 'aaa', 'aa', 'a' ]) // keep order
    expect(vm.selectedNodeMap).toEqual({
      a: true,
      aa: true,
      ab: true,
      aaa: true,
      aab: true,
      b: true,
    })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: CHECKED,
      aa: CHECKED,
      aaa: CHECKED,
      aab: CHECKED,
      ab: CHECKED,
      b: CHECKED,
    })
  })

  it('case #3', () => {
    // current:
    //   [ ] a
    //    |--[ ] aa
    //    |   |--[ ] aaa <- select
    //    |   |--[ ] aab
    //    |--[ ] ab
    //   [ ] b
    // expected result:
    //   [-] a
    //    |--[-] aa
    //    |   |--[v] aaa
    //    |   |--[ ] aab
    //    |--[ ] ab
    //   [ ] b
    vm.select(vm.nodeMap.aaa)
    expect(vm.selectedNodeIds).toEqual([ 'aaa' ])
    expect(vm.selectedNodeMap).toEqual({ aaa: true })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: INDETERMINATE,
      aa: INDETERMINATE,
      aaa: CHECKED,
      aab: UNCHECKED,
      ab: UNCHECKED,
      b: UNCHECKED,
    })

    // current:
    //   [-] a
    //    |--[-] aa
    //    |   |--[v] aaa
    //    |   |--[ ] aab
    //    |--[ ] ab <- select
    //   [ ] b
    // expected result:
    //   [-] a
    //    |--[-] aa
    //    |   |--[v] aaa
    //    |   |--[ ] aab
    //    |--[v] ab
    //   [ ] b
    vm.select(vm.nodeMap.ab)
    expect(vm.selectedNodeIds).toEqual([ 'aaa', 'ab' ])
    expect(vm.selectedNodeMap).toEqual({ aaa: true, ab: true })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: INDETERMINATE,
      aa: INDETERMINATE,
      aaa: CHECKED,
      aab: UNCHECKED,
      ab: CHECKED,
      b: UNCHECKED,
    })

    // current:
    //   [-] a
    //    |--[-] aa
    //    |   |--[v] aaa
    //    |   |--[ ] aab <- select
    //    |--[v] ab
    //   [ ] b
    // expected result:
    //   [v] a
    //    |--[v] aa
    //    |   |--[v] aaa
    //    |   |--[v] aab
    //    |--[v] ab
    //   [ ] b
    vm.select(vm.nodeMap.aab)
    expect(vm.selectedNodeIds).toEqual([ 'aaa', 'ab', 'aab', 'aa', 'a' ])
    expect(vm.selectedNodeMap).toEqual({
      a: true,
      aa: true,
      ab: true,
      aaa: true,
      aab: true,
    })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: CHECKED,
      aa: CHECKED,
      aaa: CHECKED,
      aab: CHECKED,
      ab: CHECKED,
      b: UNCHECKED,
    })
  })

  it('case #4', () => {
    // current:
    //   [ ] a
    //    |--[ ] aa
    //    |   |--[ ] aaa
    //    |   |--[ ] aab
    //    |--[ ] ab <- select
    //   [ ] b
    // expected result:
    //   [-] a
    //    |--[ ] aa
    //    |   |--[ ] aaa
    //    |   |--[ ] aab
    //    |--[v] ab
    //   [ ] b
    vm.select(vm.nodeMap.ab)
    expect(vm.selectedNodeIds).toEqual([ 'ab' ])
    expect(vm.selectedNodeMap).toEqual({ ab: true })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: INDETERMINATE,
      aa: UNCHECKED,
      aaa: UNCHECKED,
      aab: UNCHECKED,
      ab: CHECKED,
      b: UNCHECKED,
    })

    // current:
    //   [-] a
    //    |--[ ] aa
    //    |   |--[ ] aaa
    //    |   |--[ ] aab
    //    |--[v] ab
    //   [ ] b <- select
    // expected result:
    //   [-] a
    //    |--[ ] aa
    //    |   |--[ ] aaa
    //    |   |--[ ] aab
    //    |--[v] ab
    //   [v] b
    vm.select(vm.nodeMap.b)
    expect(vm.selectedNodeIds).toEqual([ 'ab', 'b' ])
    expect(vm.selectedNodeMap).toEqual({ ab: true, b: true })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: INDETERMINATE,
      aa: UNCHECKED,
      aaa: UNCHECKED,
      aab: UNCHECKED,
      ab: CHECKED,
      b: CHECKED,
    })

    // current:
    //   [-] a
    //    |--[ ] aa
    //    |   |--[ ] aaa
    //    |   |--[ ] aab <- select
    //    |--[v] ab
    //   [v] b
    // expected result:
    //   [-] a
    //    |--[-] aa
    //    |   |--[ ] aaa
    //    |   |--[v] aab
    //    |--[v] ab
    //   [v] b
    vm.select(vm.nodeMap.aab)
    expect(vm.selectedNodeIds).toEqual([ 'ab', 'b', 'aab' ])
    expect(vm.selectedNodeMap).toEqual({ aab: true, ab: true, b: true })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: INDETERMINATE,
      aa: INDETERMINATE,
      aaa: UNCHECKED,
      aab: CHECKED,
      ab: CHECKED,
      b: CHECKED,
    })

    // current:
    //   [-] a
    //    |--[-] aa
    //    |   |--[ ] aaa <- select
    //    |   |--[v] aab
    //    |--[v] ab
    //   [v] b
    // expected result:
    //   [v] a
    //    |--[v] aa
    //    |   |--[v] aaa
    //    |   |--[v] aab
    //    |--[v] ab
    //   [v] b
    vm.select(vm.nodeMap.aaa)
    expect(vm.selectedNodeIds).toEqual([ 'ab', 'b', 'aab', 'aaa', 'aa', 'a' ]) // keep order
    expect(vm.selectedNodeMap).toEqual({
      a: true,
      aa: true,
      ab: true,
      aaa: true,
      aab: true,
      b: true,
    })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: CHECKED,
      aa: CHECKED,
      aaa: CHECKED,
      aab: CHECKED,
      ab: CHECKED,
      b: CHECKED,
    })
  })

  it('case #5', () => {
    // current:
    //   [ ] a
    //    |--[ ] aa <- select
    //    |   |--[ ] aaa
    //    |   |--[ ] aab
    //    |--[ ] ab
    //   [ ] b
    // expected result:
    //   [-] a
    //    |--[v] aa
    //    |   |--[v] aaa
    //    |   |--[v] aab
    //    |--[ ] ab
    //   [ ] b
    vm.select(vm.nodeMap.aa)
    expect(vm.selectedNodeIds).toEqual([ 'aa', 'aaa', 'aab' ])
    expect(vm.selectedNodeMap).toEqual({ aa: true, aaa: true, aab: true })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: INDETERMINATE,
      aa: CHECKED,
      aaa: CHECKED,
      aab: CHECKED,
      ab: UNCHECKED,
      b: UNCHECKED,
    })

    vm.select(vm.nodeMap.a)
    expect(vm.selectedNodeIds).toEqual([])
    expect(vm.selectedNodeMap).toEqual({})
    expect(vm.nodeCheckedStateMap).toEqual({
      a: UNCHECKED,
      aa: UNCHECKED,
      aaa: UNCHECKED,
      aab: UNCHECKED,
      ab: UNCHECKED,
      b: UNCHECKED,
    })
  })

  it('case #6', () => {
    wrapper.setProps({
      options: [ {
        id: 'a',
        label: 'a',
        children: [],
      } ],
    })

    // current:
    //   [ ] a <- select
    //    |-- (no children options)
    // expected result:
    //   [v] a
    //    |-- (no children options)
    vm.select(vm.nodeMap.a)
    expect(vm.selectedNodeIds).toEqual([ 'a' ])
    expect(vm.selectedNodeMap).toEqual({ a: true })
    expect(vm.nodeCheckedStateMap).toEqual({ a: CHECKED })

    // current:
    //   [v] a <- deselect
    //    |-- (no children options)
    // expected result:
    //   [ ] a
    //    |-- (no children options)
    vm.select(vm.nodeMap.a)
    expect(vm.selectedNodeIds).toEqual([])
    expect(vm.selectedNodeMap).toEqual({})
    expect(vm.nodeCheckedStateMap).toEqual({ a: UNCHECKED })
  })
})

describe('Disable Item Selection', () => {
  describe('Single-select', () => {
    it('basic', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          multiple: false,
          options: [ {
            id: 'a',
            label: 'a',
            isDisabled: true,
          }, {
            id: 'b',
            label: 'b',
          } ],
          value: 'a',
        },
      })
      const { vm } = wrapper

      vm.select(vm.nodeMap.b)
      expect(vm.selectedNodeIds).toEqual([ 'b' ])
      vm.select(vm.nodeMap.a)
      expect(vm.selectedNodeIds).toEqual([ 'b' ])
    })

    it('nested', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          multiple: false,
          options: [ {
            id: 'a',
            label: 'a',
            isDisabled: true,
            children: [ {
              id: 'aa',
              label: 'aa',
            } ],
          }, {
            id: 'b',
            label: 'b',
            children: [ {
              id: 'ba',
              label: 'ba',
              isDisabled: true,
            }, {
              id: 'bb',
              label: 'bb',
            } ],
          }, {
            id: 'c',
            label: 'c',
            children: [ {
              id: 'ca',
              label: 'ca',
              isDisabled: true,
            }, {
              id: 'cb',
              label: 'cb',
              children: [ {
                id: 'cba',
                label: 'cba',
                isDisabled: true,
              }, {
                id: 'cbb',
                label: 'cbb',
              } ],
            } ],
          } ],
        },
      })
      const { vm } = wrapper

      vm.select(vm.nodeMap.a)
      expect(vm.selectedNodeIds).toEqual([])
      vm.select(vm.nodeMap.aa)
      expect(vm.selectedNodeIds).toEqual([])
      vm.select(vm.nodeMap.b)
      expect(vm.selectedNodeIds).toEqual([ 'b' ])
      vm.select(vm.nodeMap.ba)
      expect(vm.selectedNodeIds).toEqual([ 'b' ])
      vm.select(vm.nodeMap.bb)
      expect(vm.selectedNodeIds).toEqual([ 'bb' ])
      vm.select(vm.nodeMap.c)
      expect(vm.selectedNodeIds).toEqual([ 'c' ])
      vm.select(vm.nodeMap.ca)
      expect(vm.selectedNodeIds).toEqual([ 'c' ])
      vm.select(vm.nodeMap.cb)
      expect(vm.selectedNodeIds).toEqual([ 'cb' ])
      vm.select(vm.nodeMap.cba)
      expect(vm.selectedNodeIds).toEqual([ 'cb' ])
      vm.select(vm.nodeMap.cbb)
      expect(vm.selectedNodeIds).toEqual([ 'cbb' ])
    })
  })

  describe('Multi-select', () => {
    describe('flat=false', () => {
      it('basic', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            options: [ {
              id: 'a',
              label: 'a',
              isDisabled: true,
            }, {
              id: 'b',
              label: 'b',
              isDisabled: true,
            }, {
              id: 'c',
              label: 'c',
            } ],
            multiple: true,
            value: [ 'a' ],
          },
        })
        const { vm } = wrapper

        vm.select(vm.nodeMap.a)
        expect(vm.selectedNodeIds).toEqual([ 'a' ])
        vm.select(vm.nodeMap.b)
        expect(vm.selectedNodeIds).toEqual([ 'a' ])
        vm.select(vm.nodeMap.c)
        expect(vm.selectedNodeIds).toEqual([ 'a', 'c' ])
      })

      it('disabled parent node', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            options: [ {
              id: 'a',
              label: 'a',
              isDisabled: true,
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
              isDisabled: true,
              children: [ {
                id: 'ba',
                label: 'ba',
              }, {
                id: 'bb',
                label: 'bb',
              } ],
            }, {
              id: 'c',
              label: 'c',
              isDisabled: true,
              children: [ {
                id: 'ca',
                label: 'ca',
              }, {
                id: 'cb',
                label: 'cb',
              } ],
            } ],
            multiple: true,
            value: [ 'ba', 'c' ],
          },
        })
        const { vm } = wrapper

        // current:
        //   { } a <- select
        //    |--{ } aa
        //    |--{ } ab
        //   {-} b
        //    |--{v} ba
        //    |--{ } bb
        //   {v} c
        //    |--{v} ca
        //    |--{v} cb
        // expected result:
        //   { } a
        //    |--{ } aa
        //    |--{ } ab
        //   {-} b
        //    |--{v} ba
        //    |--{ } bb
        //   {v} c
        //    |--{v} ca
        //    |--{v} cb
        vm.select(vm.nodeMap.a)
        expect(vm.selectedNodeIds).toEqual([ 'ba', 'c', 'ca', 'cb' ])

        // current:
        //   { } a
        //    |--{ } aa
        //    |--{ } ab
        //   {-} b <- deselect
        //    |--{v} ba
        //    |--{ } bb
        //   {v} c
        //    |--{v} ca
        //    |--{v} cb
        // expected result:
        //   { } a
        //    |--{ } aa
        //    |--{ } ab
        //   {-} b
        //    |--{v} ba
        //    |--{ } bb
        //   {v} c
        //    |--{v} ca
        //    |--{v} cb
        vm.select(vm.nodeMap.b)
        expect(vm.selectedNodeIds).toEqual([ 'ba', 'c', 'ca', 'cb' ])

        // current:
        //   { } a
        //    |--{ } aa
        //    |--{ } ab
        //   {-} b
        //    |--{v} ba
        //    |--{ } bb
        //   {v} c <- deselect
        //    |--{v} ca
        //    |--{v} cb
        // expected result:
        //   { } a
        //    |--{ } aa
        //    |--{ } ab
        //   {-} b
        //    |--{v} ba
        //    |--{ } bb
        //   {v} c
        //    |--{v} ca
        //    |--{v} cb
        vm.select(vm.nodeMap.c)
        expect(vm.selectedNodeIds).toEqual([ 'ba', 'c', 'ca', 'cb' ])
      })

      it('disabled child node', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            options: [ {
              id: 'a',
              label: 'a',
              children: [ {
                id: 'aa',
                label: 'aa',
                isDisabled: true,
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
              }, {
                id: 'bb',
                label: 'bb',
                isDisabled: true,
              } ],
            }, {
              id: 'c',
              label: 'c',
              children: [ {
                id: 'ca',
                label: 'ca',
                isDisabled: true,
              }, {
                id: 'cb',
                label: 'cb',
                isDisabled: true,
              } ],
            }, {
              id: 'd',
              label: 'd',
              children: [ {
                id: 'da',
                label: 'da',
                isDisabled: true,
              }, {
                id: 'db',
                label: 'db',
                isDisabled: true,
              }, {
                id: 'dc',
                label: 'dc',
              } ],
            } ],
            multiple: true,
            value: [ 'aa', 'b', 'da' ],
          },
        })
        const { vm } = wrapper

        // current:
        //   [-] a <- deselect
        //    |--{v} aa
        //    |--[ ] ab
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d
        //    |--{v} da
        //    |--{ } db
        //    |--[ ] dc
        // expected result:
        //   [-] a
        //    |--{v} aa
        //    |--[ ] ab
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d
        //    |--{v} da
        //    |--{ } db
        //    |--[ ] dc
        vm.select(vm.nodeMap.a)
        expect(vm.selectedNodeIds).toEqual([ 'aa', 'b', 'ba', 'bb', 'da' ])

        // current:
        //   [-] a
        //    |--{v} aa
        //    |--[ ] ab <- select
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d
        //    |--{v} da
        //    |--{ } db
        //    |--[ ] dc
        // expected result:
        //   [v] a
        //    |--{v} aa
        //    |--[v] ab
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d
        //    |--{v} da
        //    |--{ } db
        //    |--[ ] dc
        vm.select(vm.nodeMap.ab)
        expect(vm.selectedNodeIds).toEqual([ 'aa', 'b', 'ba', 'bb', 'da', 'ab', 'a' ])

        // current:
        //   [v] a <- deselect
        //    |--{v} aa
        //    |--[v] ab
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d
        //    |--{v} da
        //    |--{ } db
        //    |--[ ] dc
        // expected result:
        //   [-] a
        //    |--{v} aa
        //    |--[ ] ab
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d
        //    |--{v} da
        //    |--{ } db
        //    |--[ ] dc
        vm.select(vm.nodeMap.a)
        expect(vm.selectedNodeIds).toEqual([ 'aa', 'b', 'ba', 'bb', 'da' ])

        // current:
        //   [-] a
        //    |--{v} aa
        //    |--[ ] ab <- select
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d
        //    |--{v} da
        //    |--{ } db
        //    |--[ ] dc
        // expected result:
        //   [-] a
        //    |--{v} aa
        //    |--[ ] ab
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d
        //    |--{v} da
        //    |--{ } db
        //    |--[ ] dc
        vm.select(vm.nodeMap.ab)
        expect(vm.selectedNodeIds).toEqual([ 'aa', 'b', 'ba', 'bb', 'da', 'ab', 'a' ])

        // current:
        //   [-] a
        //    |--{v} aa
        //    |--[ ] ab
        //   [v] b <- deselect
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d
        //    |--{v} da
        //    |--{ } db
        //    |--[ ] dc
        // expected result:
        //   [-] a
        //    |--{v} aa
        //    |--[ ] ab
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d
        //    |--{v} da
        //    |--{ } db
        //    |--[ ] dc
        vm.select(vm.nodeMap.b)
        expect(vm.selectedNodeIds).toEqual([ 'aa', 'b', 'ba', 'bb', 'da', 'ab', 'a' ])

        // current:
        //   [-] a
        //    |--{v} aa
        //    |--[ ] ab
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c <- select
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d
        //    |--{v} da
        //    |--{ } db
        //    |--[ ] dc
        // expected result:
        //   [-] a
        //    |--{v} aa
        //    |--[ ] ab
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d
        //    |--{v} da
        //    |--{ } db
        //    |--[ ] dc
        vm.select(vm.nodeMap.c)
        expect(vm.selectedNodeIds).toEqual([ 'aa', 'b', 'ba', 'bb', 'da', 'ab', 'a' ])

        // current:
        //   [-] a
        //    |--{v} aa
        //    |--[ ] ab
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d <- deselect
        //    |--{v} da
        //    |--{ } db
        //    |--[ ] dc
        // expected result:
        //   [-] a
        //    |--{v} aa
        //    |--[ ] ab
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d
        //    |--{v} da
        //    |--{ } db
        //    |--[ ] dc
        vm.select(vm.nodeMap.d)
        expect(vm.selectedNodeIds).toEqual([ 'aa', 'b', 'ba', 'bb', 'da', 'ab', 'a' ])

        // current:
        //   [-] a
        //    |--{v} aa
        //    |--[ ] ab
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d
        //    |--{v} da
        //    |--{ } db
        //    |--[ ] dc <- select
        // expected result:
        //   [-] a
        //    |--{v} aa
        //    |--[ ] ab
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d
        //    |--{v} da
        //    |--{ } db
        //    |--[v] dc
        vm.select(vm.nodeMap.dc)
        expect(vm.selectedNodeIds).toEqual([ 'aa', 'b', 'ba', 'bb', 'da', 'ab', 'a', 'dc' ])

        // current:
        //   [-] a
        //    |--{v} aa
        //    |--[ ] ab
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d <- deselect
        //    |--{v} da
        //    |--{ } db
        //    |--[v] dc
        // expected result:
        //   [-] a
        //    |--{v} aa
        //    |--[ ] ab
        //   [v] b
        //    |--{v} ba
        //    |--{v} bb
        //   [ ] c
        //    |--{ } ca
        //    |--{ } cb
        //   [-] d
        //    |--{v} da
        //    |--{ } db
        //    |--[ ] dc
        vm.select(vm.nodeMap.d)
        expect(vm.selectedNodeIds).toEqual([ 'aa', 'b', 'ba', 'bb', 'da', 'ab', 'a' ])
      })

      it('nested', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
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
                  isDisabled: true,
                }, {
                  id: 'abb',
                  label: 'abb',
                } ],
              } ],
            } ],
            multiple: true,
            value: [ 'aa', 'aba' ],
          },
        })
        const { vm } = wrapper

        // current:
        //   [-] a <- deselect
        //    |--{v} aa
        //    |   |--{v} aaa
        //    |   |--{v} aab
        //    |--[-] ab
        //    |   |--{v} aba
        //    |   |--[ ] abb
        // expected result:
        //   [-] a
        //    |--{v} aa
        //    |   |--{v} aaa
        //    |   |--{v} aab
        //    |--[-] ab
        //    |   |--{v} aba
        //    |   |--[ ] abb
        vm.select(vm.nodeMap.a)
        expect(vm.selectedNodeIds).toEqual([ 'aa', 'aaa', 'aab', 'aba' ])

        // current:
        //   [-] a
        //    |--{v} aa
        //    |   |--{v} aaa
        //    |   |--{v} aab
        //    |--[-] ab <- deselect
        //    |   |--{v} aba
        //    |   |--[ ] abb
        // expected result:
        //   [-] a
        //    |--{v} aa
        //    |   |--{v} aaa
        //    |   |--{v} aab
        //    |--[-] ab
        //    |   |--{v} aba
        //    |   |--[ ] abb
        vm.select(vm.nodeMap.ab)
        expect(vm.selectedNodeIds).toEqual([ 'aa', 'aaa', 'aab', 'aba' ])

        // current:
        //   [-] a
        //    |--{v} aa
        //    |   |--{v} aaa
        //    |   |--{v} aab
        //    |--[-] ab
        //    |   |--{v} aba
        //    |   |--[ ] abb <- select
        // expected result:
        //   [v] a
        //    |--{v} aa
        //    |   |--{v} aaa
        //    |   |--{v} aab
        //    |--[v] ab
        //    |   |--{v} aba
        //    |   |--[v] abb
        vm.select(vm.nodeMap.abb)
        expect(vm.selectedNodeIds).toEqual([ 'aa', 'aaa', 'aab', 'aba', 'abb', 'ab', 'a' ])
      })
    })

    describe('flat=true', () => {
      it('basic', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            flat: true,
            multiple: true,
            options: [ {
              id: 'a',
              label: 'a',
              isDisabled: true,
              children: [ {
                id: 'aa',
                label: 'aa',
              } ],
            }, {
              id: 'b',
              label: 'b',
              children: [ {
                id: 'ba',
                label: 'ba',
                isDisabled: true,
              }, {
                id: 'bb',
                label: 'bb',
              } ],
            } ],
          },
        })
        const { vm } = wrapper

        vm.select(vm.nodeMap.a)
        expect(vm.selectedNodeIds).toEqual([])
        vm.select(vm.nodeMap.aa)
        expect(vm.selectedNodeIds).toEqual([ 'aa' ])
        vm.select(vm.nodeMap.aa)
        expect(vm.selectedNodeIds).toEqual([])
        vm.select(vm.nodeMap.b)
        expect(vm.selectedNodeIds).toEqual([ 'b' ])
        vm.select(vm.nodeMap.ba)
        expect(vm.selectedNodeIds).toEqual([ 'b' ])
        vm.select(vm.nodeMap.bb)
        expect(vm.selectedNodeIds).toEqual([ 'b', 'bb' ])
      })

      it('nested', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            flat: true,
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
                  isDisabled: true,
                }, {
                  id: 'aab',
                  label: 'aab',
                } ],
              } ],
            } ],
          },
        })
        const { vm } = wrapper

        vm.select(vm.nodeMap.a)
        expect(vm.selectedNodeIds).toEqual([ 'a' ])
        vm.select(vm.nodeMap.aa)
        expect(vm.selectedNodeIds).toEqual([ 'a' ])
        vm.select(vm.nodeMap.aaa)
        expect(vm.selectedNodeIds).toEqual([ 'a' ])
        vm.select(vm.nodeMap.aab)
        expect(vm.selectedNodeIds).toEqual([ 'a', 'aab' ])
      })
    })
  })
})
