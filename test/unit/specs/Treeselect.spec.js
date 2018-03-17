import Vue from 'vue'
import { mount } from 'avoriaz'
import Treeselect from '@riophae/vue-treeselect/components/Treeselect'
import TreeselectOption from '@riophae/vue-treeselect/components/Option'
import SearchInput from '@riophae/vue-treeselect/components/SearchInput'
import { UNCHECKED, INDETERMINATE, CHECKED } from '@riophae/vue-treeselect/constants'

// disable the tip that suggests using devtools extension
Vue.config.devtools = false

const BUTTON_LEFT = { button: 0 }
const KEY_BACKSPACE = { which: 8, keyCode: 8 }
const KEY_DELETE = { which: 46, keyCode: 46 }
const KEY_ESCAPE = { which: 27, keyCode: 27 }
const KEY_A = { which: 65, keyCode: 65 }

function sleep(duration) {
  return new Promise(resolve => setTimeout(resolve, duration))
}

// currently avoriaz has a bad support for keyboard event testing
// so here we implement it ourself
function customTrigger(wrapper, eventType, eventData) {
  const event = document.createEvent('Event')
  event.initEvent(eventType, true, true)
  Object.assign(event, eventData)
  wrapper.element.dispatchEvent(event)
  wrapper.update()
}

async function typeSearchText(wrapper, text) {
  // eslint-disable-next-line newline-per-chained-call
  wrapper.first(SearchInput).instance().onInput({
    target: {
      value: text,
    },
  })
  await sleep(300)
  expect(wrapper.vm.searchQuery).toBe(text)
}

describe('Basic', () => {
  describe('nodeMap', () => {
    it('should be able to obtain normalized node by id', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'id',
            label: 'label',
          } ],
        },
      })
      const { vm } = wrapper

      expect(vm.nodeMap).toBeObject()
      expect(Object.getPrototypeOf(vm.nodeMap)).toBe(null)
      expect(vm.nodeMap.id).toBeObject()
    })
  })

  describe('normalized', () => {
    it('shape', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            // branch node
            id: 'a',
            label: 'a',
            children: [ {
              // leaf node
              id: 'aa',
              label: 'aa',
            } ],
          } ],
        },
      })
      const { vm } = wrapper
      const { a, aa } = vm.nodeMap

      expect(vm.nodeMap).toEqual({
        a: jasmine.any(Object),
        aa: jasmine.any(Object),
      })

      expect(a).toEqual({
        id: jasmine.any(String),
        label: jasmine.any(String),
        isLeaf: jasmine.any(Boolean),
        isBranch: jasmine.any(Boolean),
        isRootNode: jasmine.any(Boolean),
        isExpanded: jasmine.any(Boolean),
        isMatched: jasmine.any(Boolean),
        isDisabled: jasmine.any(Boolean),
        isLoaded: jasmine.any(Boolean),
        isPending: jasmine.any(Boolean),
        hasMatchedChild: jasmine.any(Boolean),
        hasDisabledDescendants: jasmine.any(Boolean),
        expandsOnSearch: jasmine.any(Boolean),
        parentNode: null,
        ancestors: jasmine.any(Array),
        index: jasmine.any(Array),
        children: jasmine.any(Array),
        level: jasmine.any(Number),
        loadingChildrenError: jasmine.any(String),
        count: {
          ALL_CHILDREN: jasmine.any(Number),
          ALL_DESCENDANTS: jasmine.any(Number),
          LEAF_CHILDREN: jasmine.any(Number),
          LEAF_DESCENDANTS: jasmine.any(Number),
        },
        raw: jasmine.any(Object),
      })

      expect(aa).toEqual({
        id: jasmine.any(String),
        label: jasmine.any(String),
        isLeaf: jasmine.any(Boolean),
        isBranch: jasmine.any(Boolean),
        isRootNode: jasmine.any(Boolean),
        isMatched: jasmine.any(Boolean),
        isDisabled: jasmine.any(Boolean),
        parentNode: jasmine.any(Object),
        ancestors: jasmine.any(Array),
        index: jasmine.any(Array),
        level: jasmine.any(Number),
        raw: jasmine.any(Object),
      })
    })

    it('id & label', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
          } ],
        },
      })
      const { vm } = wrapper

      expect(vm.nodeMap.a.id).toBe('a')
      expect(vm.nodeMap.a.label).toBe('a')
    })

    describe('isDisabled', () => {
      it('flat=false', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            flat: false,
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
                children: [ {
                  id: 'caa',
                  label: 'caa',
                } ],
              } ],
            } ],
          },
        })
        const { vm } = wrapper
        const { a, aa, b, ba, bb, c, ca, caa } = vm.nodeMap

        expect(a.isDisabled).toBe(true)
        expect(aa.isDisabled).toBe(true)
        expect(b.isDisabled).toBe(false)
        expect(ba.isDisabled).toBe(true)
        expect(bb.isDisabled).toBe(false)
        expect(c.isDisabled).toBe(false)
        expect(ca.isDisabled).toBe(true)
        expect(caa.isDisabled).toBe(true)
      })

      it('flat=true', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            flat: true,
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
                children: [ {
                  id: 'caa',
                  label: 'caa',
                } ],
              } ],
            } ],
          },
        })
        const { vm } = wrapper
        const { a, aa, b, ba, bb, c, ca, caa } = vm.nodeMap

        expect(a.isDisabled).toBe(true)
        expect(aa.isDisabled).toBe(false)
        expect(b.isDisabled).toBe(false)
        expect(ba.isDisabled).toBe(true)
        expect(bb.isDisabled).toBe(false)
        expect(c.isDisabled).toBe(false)
        expect(ca.isDisabled).toBe(true)
        expect(caa.isDisabled).toBe(false)
      })
    })

    it('hasDisabledDescendants', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          flat: true,
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
            } ],
          } ],
        },
      })
      const { vm } = wrapper
      const { a, aa } = vm.nodeMap

      expect(a.hasDisabledDescendants).toBe(true)
      expect(aa.hasDisabledDescendants).toBe(false)
    })

    it('isLeaf & isBranch & isLoaded', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            // leaf node
            id: 'a',
            label: 'a',
          }, {
            // branch node with no children
            id: 'b',
            label: 'b',
            children: [],
          }, {
            // unloaded branch node
            id: 'c',
            label: 'c',
            children: null,
          }, {
            // unloaded branch node
            id: 'd',
            label: 'd',
            isBranch: true,
          } ],
          loadChildrenOptions() { /* empty */ },
        },
      })
      const { vm } = wrapper
      const { a, b, c, d } = vm.nodeMap

      expect(a).toEqual(jasmine.objectContaining({
        isLeaf: true,
        isBranch: false,
      }))

      expect(b).toEqual(jasmine.objectContaining({
        isLeaf: false,
        isBranch: true,
        children: [],
        isLoaded: true,
      }))

      expect(c).toEqual(jasmine.objectContaining({
        isLeaf: false,
        isBranch: true,
        children: [],
        isLoaded: false,
      }))

      expect(d).toEqual(jasmine.objectContaining({
        isLeaf: false,
        isBranch: true,
        children: [],
        isLoaded: false,
      }))
    })

    it('isDefaultExpanded', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            isDefaultExpanded: true,
            children: [],
          }, {
            id: 'b',
            label: 'b',
            isDefaultExpanded: false,
            children: [],
          } ],
        },
      })
      const { a, b } = wrapper.vm.nodeMap

      expect(a).toEqual(jasmine.objectContaining({ isExpanded: true }))
      expect(b).toEqual(jasmine.objectContaining({ isExpanded: false }))
    })

    it('isRootNode', () => {
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
      const { a, aa } = vm.nodeMap

      expect(a.isRootNode).toBe(true)
      expect(aa.isRootNode).toBe(false)
    })

    it('parentNode & ancestors & level', () => {
      const wrapper = mount(Treeselect, {
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
              } ],
            } ],
          } ],
        },
      })
      const { vm } = wrapper
      const { a, aa, aaa } = vm.nodeMap

      expect(a.parentNode).toBe(null)
      expect(aa.parentNode).toBe(a)
      expect(aaa.parentNode).toBe(aa)

      expect(a.ancestors).toEqual([])
      expect(aa.ancestors).toEqual([ a ])
      expect(aaa.ancestors).toEqual([ a, aa ])

      expect(a.level).toBe(0)
      expect(aa.level).toBe(1)
      expect(aaa.level).toBe(2)
    })

    it('index', () => {
      const wrapper = mount(Treeselect, {
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
            }, {
              id: 'bb',
              label: 'bb',
              children: [ {
                id: 'bba',
                label: 'bba',
              } ],
            } ],
          } ],
        },
      })
      const { vm } = wrapper
      const { a, aa, aaa, ab, b, ba, bb, bba } = vm.nodeMap

      expect(a.index).toEqual([ 0 ])
      expect(aa.index).toEqual([ 0, 0 ])
      expect(aaa.index).toEqual([ 0, 0, 0 ])
      expect(ab.index).toEqual([ 0, 1 ])
      expect(b.index).toEqual([ 1 ])
      expect(ba.index).toEqual([ 1, 0 ])
      expect(bb.index).toEqual([ 1, 1 ])
      expect(bba.index).toEqual([ 1, 1, 0 ])
    })

    it('count', () => {
      const wrapper = mount(Treeselect, {
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
          } ],
        },
      })
      const { vm } = wrapper
      const { a, b, aa, ab } = vm.nodeMap

      expect(a.count).toEqual({
        ALL_CHILDREN: 2,
        ALL_DESCENDANTS: 4,
        LEAF_CHILDREN: 1,
        LEAF_DESCENDANTS: 3,
      })

      expect(b).not.toHaveMember('count')

      expect(aa.count).toEqual({
        ALL_CHILDREN: 2,
        ALL_DESCENDANTS: 2,
        LEAF_CHILDREN: 2,
        LEAF_DESCENDANTS: 2,
      })

      expect(ab).not.toHaveMember('count')
    })

    it('raw', () => {
      const rawAa = {
        id: 'aa',
        label: 'aa',
      }
      const rawA = {
        id: 'a',
        label: 'a',
        children: [ rawAa ],
      }
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ rawA ],
        },
      })
      const { vm } = wrapper
      const { a, aa } = vm.nodeMap

      expect(a.raw).toBe(rawA)
      expect(aa.raw).toBe(rawAa)
    })
  })

  it('rootOptions', () => {
    const wrapper = mount(Treeselect, {
      propsData: {
        options: [ {
          id: 'a',
          label: 'a',
          children: [ {
            id: 'aa',
            label: 'aa',
          } ],
        }, {
          id: 'b',
          label: 'b',
        } ],
      },
    })
    const { vm } = wrapper
    const { a, b } = vm.nodeMap

    expect(vm.normalizedOptions).toEqual([ a, b ])
    vm.normalizedOptions.forEach(normalized => {
      expect(normalized.isRootNode).toBe(true)
    })
  })

  it('should accept undefined/null', () => {
    [ true, false ].forEach(multiple => {
      [ undefined, null ].forEach(value => {
        const wrapper = mount(Treeselect, {
          propsData: {
            multiple,
            value,
            options: [ {
              id: 'a',
              label: 'a',
              children: [ {
                id: 'aa',
                label: 'aa',
              } ],
            }, {
              id: 'b',
              label: 'b',
            } ],
          },
        })
        const { vm } = wrapper

        expect(vm.internalValue).toBeEmptyArray()
      })
    })
  })

  it('should warn about duplicate node ids', () => {
    spyOn(console, 'error')

    mount(Treeselect, {
      propsData: {
        options: [ {
          id: 'same_id',
          label: 'a',
        }, {
          id: 'same_id',
          label: 'b',
        } ],
      },
    })

    expect(console.error).toHaveBeenCalledWith(
      '[Vue-Treeselect Warning]',
      'Detected duplicate presence of node id "same_id". ' +
        'Their labels are "a" and "b" respectively.'
    )
  })

  it('should rebuild state after swithching from single to multiple', () => {
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
        multiple: false,
        value: [ 'a' ],
      },
    })

    expect(wrapper.data().nodeCheckedStateMap).toBeEmptyObject()
    wrapper.setProps({ multiple: true })
    expect(wrapper.data().nodeCheckedStateMap).toBeNonEmptyObject()
  })

  it('should rebuild state after value changed externally when multiple=true', () => {
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
        multiple: true,
        value: [],
      },
    })

    expect(wrapper.data().nodeCheckedStateMap).toEqual({
      a: 0,
      aa: 0,
    })
    wrapper.setProps({ value: [ 'a' ] })
    expect(wrapper.data().nodeCheckedStateMap).toEqual({
      a: 2,
      aa: 2,
    })
  })

  it('v-model support', async done => {
    // avoriaz doesn't support testing v-model
    // so here we write vanila vue code
    const vm = new Vue({
      components: { Treeselect },
      data: {
        value: [],
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
          />
        </div>
      `,
    }).$mount()
    const comp = vm.$children[0]

    comp.select(comp.nodeMap.a)
    await comp.$nextTick()
    expect(vm.value).toEqual([ 'a' ])
    comp.select(comp.nodeMap.a)
    await comp.$nextTick()
    expect(vm.value).toEqual([])
    done()
  })
})

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

    expect(vm.internalValue).toBeEmptyArray()
    vm.select(a) // select one
    expect(vm.internalValue).toEqual([ 'a' ])
    expect(vm.selectedNodeMap).toEqual({ a: true })
    vm.select(aa) // select another
    expect(vm.internalValue).toEqual([ 'aa' ])
    expect(vm.selectedNodeMap).toEqual({ aa: true })
    vm.select(aa) // select again
    expect(vm.internalValue).toEqual([ 'aa' ])
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
    const labelWrapper = wrapper.first(TreeselectOption).first('.vue-treeselect__label-wrapper')

    customTrigger(labelWrapper, 'mousedown', BUTTON_LEFT)
    expect(wrapper.data()).toEqual(jasmine.objectContaining({
      internalValue: [ 'a' ],
      isFocused: false,
      isOpen: false,
    }))
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
    expect(vm.internalValue).toEqual([ 'a' ])
    expect(vm.selectedNodeMap).toEqual({ a: true })
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
    expect(vm.internalValue).toEqual([ 'ab' ])
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
    expect(vm.internalValue).toEqual([ 'ab', 'b' ])
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
    expect(vm.internalValue).toEqual([ 'b', 'a' ]) // a should be after b
    expect(vm.selectedNodeMap).toEqual({ a: true, b: true })
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
    expect(vm.internalValue).toEqual([ 'b' ])
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
    expect(vm.internalValue).toEqual([ 'b', 'aa' ])
    expect(vm.selectedNodeMap).toEqual({ aa: true, b: true })
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
    expect(vm.internalValue).toEqual([ 'b' ])
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
    expect(vm.internalValue).toEqual([ 'a' ])
    expect(vm.selectedNodeMap).toEqual({ a: true })
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
    expect(vm.internalValue).toEqual([ 'a', 'b' ])
    expect(vm.selectedNodeMap).toEqual({ a: true, b: true })
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
    expect(vm.internalValue).toEqual([ 'b', 'aab', 'ab' ]) // keep order
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
    expect(vm.internalValue).toEqual([ 'b', 'a' ]) // keep order
    expect(vm.selectedNodeMap).toEqual({ a: true, b: true })
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
    expect(vm.internalValue).toEqual([ 'aaa' ])
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
    expect(vm.internalValue).toEqual([ 'aaa', 'ab' ])
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
    expect(vm.internalValue).toEqual([ 'a' ])
    expect(vm.selectedNodeMap).toEqual({ a: true })
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
    expect(vm.internalValue).toEqual([ 'ab' ])
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
    expect(vm.internalValue).toEqual([ 'ab', 'b' ])
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
    expect(vm.internalValue).toEqual([ 'ab', 'b', 'aab' ])
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
    expect(vm.internalValue).toEqual([ 'b', 'a' ]) // keep order
    expect(vm.selectedNodeMap).toEqual({ a: true, b: true })
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
    expect(vm.internalValue).toEqual([ 'aa' ])
    expect(vm.selectedNodeMap).toEqual({ aa: true })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: INDETERMINATE,
      aa: CHECKED,
      aaa: CHECKED,
      aab: CHECKED,
      ab: UNCHECKED,
      b: UNCHECKED,
    })

    vm.select(vm.nodeMap.a)
    expect(vm.internalValue).toEqual([])
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
      expect(vm.internalValue).toEqual([ 'b' ])
      vm.select(vm.nodeMap.a)
      expect(vm.internalValue).toEqual([ 'b' ])
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
      expect(vm.internalValue).toEqual([])
      vm.select(vm.nodeMap.aa)
      expect(vm.internalValue).toEqual([])
      vm.select(vm.nodeMap.b)
      expect(vm.internalValue).toEqual([ 'b' ])
      vm.select(vm.nodeMap.ba)
      expect(vm.internalValue).toEqual([ 'b' ])
      vm.select(vm.nodeMap.bb)
      expect(vm.internalValue).toEqual([ 'bb' ])
      vm.select(vm.nodeMap.c)
      expect(vm.internalValue).toEqual([ 'c' ])
      vm.select(vm.nodeMap.ca)
      expect(vm.internalValue).toEqual([ 'c' ])
      vm.select(vm.nodeMap.cb)
      expect(vm.internalValue).toEqual([ 'cb' ])
      vm.select(vm.nodeMap.cba)
      expect(vm.internalValue).toEqual([ 'cb' ])
      vm.select(vm.nodeMap.cbb)
      expect(vm.internalValue).toEqual([ 'cbb' ])
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
        expect(vm.internalValue).toEqual([ 'a' ])
        vm.select(vm.nodeMap.b)
        expect(vm.internalValue).toEqual([ 'a' ])
        vm.select(vm.nodeMap.c)
        expect(vm.internalValue).toEqual([ 'a', 'c' ])
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

        vm.select(vm.nodeMap.a)
        expect(vm.internalValue).toEqual([ 'ba', 'c' ])
        vm.select(vm.nodeMap.b)
        expect(vm.internalValue).toEqual([ 'ba', 'c' ])
        vm.select(vm.nodeMap.c)
        expect(vm.internalValue).toEqual([ 'ba', 'c' ])
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

        vm.select(vm.nodeMap.a)
        expect(vm.internalValue).toEqual([ 'aa', 'b', 'da' ])
        vm.select(vm.nodeMap.ab)
        expect(vm.internalValue).toEqual([ 'b', 'da', 'a' ])
        vm.select(vm.nodeMap.a)
        expect(vm.internalValue).toEqual([ 'b', 'da', 'aa' ])
        vm.select(vm.nodeMap.ab)
        expect(vm.internalValue).toEqual([ 'b', 'da', 'a' ])
        vm.select(vm.nodeMap.b)
        expect(vm.internalValue).toEqual([ 'b', 'da', 'a' ])
        vm.select(vm.nodeMap.c)
        expect(vm.internalValue).toEqual([ 'b', 'da', 'a' ])
        vm.select(vm.nodeMap.d)
        expect(vm.internalValue).toEqual([ 'b', 'da', 'a' ])
        vm.select(vm.nodeMap.dc)
        expect(vm.internalValue).toEqual([ 'b', 'da', 'a', 'dc' ])
        vm.select(vm.nodeMap.d)
        expect(vm.internalValue).toEqual([ 'b', 'da', 'a' ])
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

        vm.select(vm.nodeMap.a)
        expect(vm.internalValue).toEqual([ 'aa', 'aba' ])
        vm.select(vm.nodeMap.ab)
        expect(vm.internalValue).toEqual([ 'aa', 'aba' ])
        vm.select(vm.nodeMap.abb)
        expect(vm.internalValue).toEqual([ 'a' ])
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
        expect(vm.internalValue).toEqual([])
        vm.select(vm.nodeMap.aa)
        expect(vm.internalValue).toEqual([ 'aa' ])
        vm.select(vm.nodeMap.aa)
        expect(vm.internalValue).toEqual([])
        vm.select(vm.nodeMap.b)
        expect(vm.internalValue).toEqual([ 'b' ])
        vm.select(vm.nodeMap.ba)
        expect(vm.internalValue).toEqual([ 'b' ])
        vm.select(vm.nodeMap.bb)
        expect(vm.internalValue).toEqual([ 'b', 'bb' ])
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
        expect(vm.internalValue).toEqual([ 'a' ])
        vm.select(vm.nodeMap.aa)
        expect(vm.internalValue).toEqual([ 'a' ])
        vm.select(vm.nodeMap.aaa)
        expect(vm.internalValue).toEqual([ 'a' ])
        vm.select(vm.nodeMap.aab)
        expect(vm.internalValue).toEqual([ 'a', 'aab' ])
      })
    })
  })
})

describe('SearchInput', () => {
  it('should disable auto complete', () => {
    const wrapper = mount(Treeselect, {
      propsData: {
        options: [],
      },
    })
    const input = wrapper.first('.vue-treeselect__input')
    expect(input.element.getAttribute('autocomplete')).toBe('off')
  })

  it('should be unable to focus when disabled=true', () => {
    const wrapper = mount(Treeselect, {
      propsData: {
        options: [],
        autofocus: false,
        searchable: true,
        disabled: true,
      },
    })

    expect(wrapper.vm.isFocused).toBe(false)
    wrapper.vm.focusInput()
    expect(wrapper.vm.isFocused).toBe(false)
  })
})

describe('Control', () => {
  it('should toggle the menu when arrow is clicked', () => {
    const wrapper = mount(Treeselect, {
      attachToDocument: true,
      propsData: {
        options: [],
      },
    })
    const arrow = wrapper.first('.vue-treeselect__arrow-wrapper')

    customTrigger(arrow, 'mousedown', BUTTON_LEFT)
    expect(wrapper.vm.isOpen).toBe(true)
    customTrigger(arrow, 'mousedown', BUTTON_LEFT)
    expect(wrapper.vm.isOpen).toBe(false)
  })
})

describe('Menu', () => {
  it('should blur the input & close the menu after clicking anywhere outside the component', () => {
    const wrapper = mount(Treeselect, {
      attachToDocument: true,
      propsData: {
        options: [],
      },
    })

    wrapper.vm.openMenu()
    const event = document.createEvent('event')
    event.initEvent('mousedown', true, true)
    document.body.dispatchEvent(event)
    expect(wrapper.data()).toEqual(jasmine.objectContaining({
      isFocused: false,
      isOpen: false,
    }))
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
    const valueWrapper = wrapper.first('.vue-treeselect__value-wrapper')

    customTrigger(valueWrapper, 'mousedown', BUTTON_LEFT)
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
    const value = wrapper.first('.vue-treeselect__value-wrapper')
    customTrigger(value, 'mousedown', BUTTON_LEFT)
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

    const [ firstRemove, secondRemove ] = wrapper.find('.vue-treeselect__value-remove')

    customTrigger(firstRemove, 'mousedown', BUTTON_LEFT)
    expect(wrapper.data()).toEqual(jasmine.objectContaining({
      isOpen: true,
      internalValue: [ 'b' ],
    }))

    customTrigger(secondRemove, 'mousedown', BUTTON_LEFT)
    expect(wrapper.data()).toEqual(jasmine.objectContaining({
      isOpen: true,
      internalValue: [],
    }))
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
    const option = wrapper.first(TreeselectOption)
    const optionArrow = option.first('.vue-treeselect__option-arrow-wrapper')
    customTrigger(optionArrow, 'mousedown', BUTTON_LEFT)
    expect(a.isExpanded).toBe(true)
    customTrigger(optionArrow, 'mousedown', BUTTON_LEFT)
    expect(a.isExpanded).toBe(false)
  })
})

describe('Keyboard Support', () => {
  function queryInput(wrapper) {
    return wrapper.first('input[type="text"]')
  }

  describe('backspace key', () => {
    let wrapper, input

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
      input = queryInput(wrapper)

      expect(wrapper.vm.searchQuery).toBe('')
      expect(wrapper.vm.internalValue).toEqual([ 'a', 'b' ])
    })

    it('should remove the last value if search input is empty', () => {
      customTrigger(input, 'keydown', KEY_BACKSPACE)
      expect(wrapper.vm.internalValue).toEqual([ 'a' ])
      customTrigger(input, 'keydown', KEY_BACKSPACE)
      expect(wrapper.vm.internalValue).toEqual([])
    })

    it('should do nothing if search input has value', async done => {
      await typeSearchText(wrapper, 'test')
      expect(wrapper.vm.searchQuery).toBe('test')
      customTrigger(input, 'keydown', KEY_BACKSPACE)
      expect(wrapper.vm.internalValue).toEqual([ 'a', 'b' ])
      done()
    })

    it('should do nothing when backspaceRemoves=false', () => {
      wrapper.setProps({ backspaceRemoves: false })
      customTrigger(input, 'keydown', KEY_BACKSPACE)
      expect(wrapper.vm.internalValue).toEqual([ 'a', 'b' ])
    })
  })

  describe('delete key', () => {
    let wrapper, input

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
      input = queryInput(wrapper)

      expect(wrapper.vm.searchQuery).toBe('')
      expect(wrapper.vm.internalValue).toEqual([ 'a', 'b' ])
    })

    it('should remove the last value if search input is empty', () => {
      customTrigger(input, 'keydown', KEY_DELETE)
      expect(wrapper.vm.internalValue).toEqual([ 'a' ])
      customTrigger(input, 'keydown', KEY_DELETE)
      expect(wrapper.vm.internalValue).toEqual([])
    })

    it('should do nothing if search input has value', async done => {
      await typeSearchText(wrapper, 'test')
      expect(wrapper.vm.searchQuery).toBe('test')
      customTrigger(input, 'keydown', KEY_DELETE)
      expect(wrapper.vm.internalValue).toEqual([ 'a', 'b' ])
      done()
    })

    it('should do nothing when backspaceRemoves=false', () => {
      wrapper.setProps({ deleteRemoves: false })
      customTrigger(input, 'keydown', KEY_DELETE)
      expect(wrapper.vm.internalValue).toEqual([ 'a', 'b' ])
    })
  })

  describe('escape key', () => {
    let wrapper, input

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
      input = queryInput(wrapper)
    })

    it('should reset search query if input has value', async done => {
      await typeSearchText(wrapper, 'test')
      customTrigger(input, 'keydown', KEY_ESCAPE)
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        searchQuery: '',
        internalValue: [ 'a', 'b' ],
      }))
      done()
    })

    it('should close the menu if input is empty', () => {
      wrapper.vm.openMenu()
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        searchQuery: '',
        internalValue: [ 'a', 'b' ],
      }))
      customTrigger(input, 'keydown', KEY_ESCAPE)
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        searchQuery: '',
        internalValue: [ 'a', 'b' ],
        isOpen: false,
      }))
    })

    it('should reset value if menu is closed', () => {
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        searchQuery: '',
        internalValue: [ 'a', 'b' ],
        isOpen: false,
      }))
      customTrigger(input, 'keydown', KEY_ESCAPE)
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        searchQuery: '',
        internalValue: [],
        isOpen: false,
      }))
    })

    it('should not reset value when escapeClearsValue=false', () => {
      wrapper.setProps({ escapeClearsValue: false })
      customTrigger(input, 'keydown', KEY_ESCAPE)
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        searchQuery: '',
        internalValue: [ 'a', 'b' ],
        isOpen: false,
      }))
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
      const input = queryInput(wrapper)

      customTrigger(input, 'keydown', { ...KEY_ESCAPE, [modifierKey]: true })
      expect(wrapper.vm.internalValue).toEqual([ 'a' ])
    })
  })

  it('any other key press should activate menu', () => {
    const wrapper = mount(Treeselect, {
      propsData: {
        options: [],
      },
    })
    const input = queryInput(wrapper)

    expect(wrapper.vm.isOpen).toBe(false)
    customTrigger(input, 'keydown', KEY_A)
    expect(wrapper.vm.isOpen).toBe(true)
  })
})

describe('Props', () => {
  describe('alwaysOpen', () => {
    it('should auto open the menu on mount', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
        },
      })
      const { vm } = wrapper

      expect(vm.isOpen).toBe(true)
    })

    it('should hide the arrow', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
        },
      })

      wrapper.update() // the arrow exists on first render
      expect(wrapper.contains('.vue-treeselect__arrow-wrapper')).toBe(false)
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
      expect(vm.isOpen).toBe(true)
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

      expect(vm.isOpen).toBe(false)
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

      expect(vm.isOpen).toBe(true)
      wrapper.setProps({ disabled: true })
      expect(vm.isOpen).toBe(false)
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

      expect(vm.isOpen).toBe(false)
      wrapper.setProps({ disabled: false })
      expect(vm.isOpen).toBe(true)
    })

    it('should show the arrow when disabled', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
          disabled: true,
        },
      })

      expect(wrapper.contains('.vue-treeselect__arrow-wrapper')).toBe(true)
    })

    it('set `alwaysOpen` from `false` to `true` should open the menu and hide the arrow', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: false,
        },
      })
      const { vm } = wrapper

      expect(vm.isOpen).toBe(false)
      wrapper.setProps({ alwaysOpen: true })
      expect(vm.isOpen).toBe(true)
      expect(wrapper.contains('.vue-treeselect__arrow-wrapper')).toBe(false)
    })

    it('set `alwaysOpen` from `true` to `false` should close the menu and show the arrow', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
        },
      })
      const { vm } = wrapper

      expect(vm.isOpen).toBe(true)
      wrapper.setProps({ alwaysOpen: false })
      expect(vm.isOpen).toBe(false)
      expect(wrapper.contains('.vue-treeselect__arrow-wrapper')).toBe(true)
    })
  })

  describe('autofocus', () => {
    it('should focus the search input on mount', () => {
      const wrapper = mount(Treeselect, {
        attachToDocument: true,
        propsData: {
          options: [],
          autofocus: true,
          searchable: true,
        },
      })
      const input = wrapper.first('.vue-treeselect__input').element
      expect(document.activeElement).toBe(input)
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

      expect(vm.normalizedOptions.map(node => node.id)).toEqual([ 'b', 'a', 'c' ])
      expect(vm.nodeMap.b.children.map(node => node.id)).toEqual([ 'bb', 'ba', 'bc' ])
    })
  })

  describe('clearable', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          multiple: false,
          clearable: true,
          options: [ { id: 'a', label: 'a' } ],
          value: 'a',
        },
      })
    })

    it('should show "×" icon', () => {
      expect(wrapper.contains('.vue-treeselect__clear')).toBe(true)
    })

    it('should reset value on mousedown', () => {
      expect(wrapper.vm.internalValue).toEqual([ 'a' ])
      customTrigger(wrapper.first('.vue-treeselect__clear'), 'mousedown', BUTTON_LEFT)
      expect(wrapper.vm.internalValue).toEqual([])
    })

    it('should hide when no options selected', () => {
      wrapper.vm.clear()
      wrapper.update()
      expect(wrapper.contains('.vue-treeselect__clear')).toBe(false)
    })

    it('should hide when disabled=true', () => {
      wrapper.setProps({ disabled: true })
      expect(wrapper.contains('.vue-treeselect__clear')).toBe(false)
    })

    it('should hide when clearable=false', () => {
      wrapper.setProps({ clearable: false })
      expect(wrapper.contains('.vue-treeselect__clear')).toBe(false)
    })
  })

  describe('clearAllText', () => {
    it('should be the title of "×" icon when multiple=true', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          clearable: true,
          multiple: true,
          clearAllText: '$MULTI_TITLE$',
          options: [ { id: 'a', label: 'a' } ],
          value: [ 'a' ],
        },
      })

      expect(wrapper.first('.vue-treeselect__clear').getAttribute('title')).toBe('$MULTI_TITLE$')
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
          data: {
            searching: true,
            searchQuery: '$SEARCH_QUERY$',
          },
        })
        const { vm } = wrapper

        vm.select(vm.nodeMap.a)
        wrapper.update()
        expect(vm.searchQuery).toBe('')
      })

      it('still clears the input after selecting even if clearOnSelect!=true', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            clearOnSelect: false,
            multiple: false,
            options: [ { id: 'a', label: 'a' } ],
          },
          data: {
            searching: true,
            searchQuery: '$SEARCH_QUERY$',
          },
        })
        const { vm } = wrapper

        vm.select(vm.nodeMap.a)
        wrapper.update()
        expect(vm.searchQuery).toBe('')
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
          data: {
            searching: true,
            searchQuery: '$SEARCH_QUERY$',
          },
        })
        const { vm } = wrapper

        vm.select(vm.nodeMap.a)
        wrapper.update()
        expect(vm.searchQuery).toBe('')
      })

      it("won't clear the input after selecting when clearOnSelect!=true", () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            clearOnSelect: false,
            multiple: true,
            options: [ { id: 'a', label: 'a' } ],
          },
          data: {
            searching: true,
            searchQuery: '$SEARCH_QUERY$',
          },
        })
        const { vm } = wrapper

        vm.select(vm.nodeMap.a)
        wrapper.update()
        expect(vm.searchQuery).toBe('$SEARCH_QUERY$')
      })
    })
  })

  describe('clearValueText', () => {
    it('should be the title of "×" icon when multiple=false', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          clearable: true,
          multiple: false,
          clearValueText: '$SINGLE_TITLE$',
          options: [ { id: 'a', label: 'a' } ],
          value: 'a',
        },
      })

      expect(wrapper.first('.vue-treeselect__clear').getAttribute('title')).toBe('$SINGLE_TITLE$')
    })
  })

  describe('closeOnSelect', () => {
    it('closes the menu after selecting when closeOnSelect=true', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          closeOnSelect: true,
          multiple: false,
          options: [ { id: 'a', label: 'a' } ],
        },
        data: {
          isOpen: true,
        },
      })
      const labelWrapper = wrapper.first('.vue-treeselect__label-wrapper')

      customTrigger(labelWrapper, 'mousedown', BUTTON_LEFT)
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        internalValue: [ 'a' ],
        isOpen: false,
      }))
    })

    it('keeps the menu open after selecting when closeOnSelect=false', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          closeOnSelect: false,
          multiple: false,
          searchable: true,
          options: [ { id: 'a', label: 'a' } ],
        },
        data: {
          isOpen: true,
        },
      })
      const labelWrapper = wrapper.first('.vue-treeselect__label-wrapper')

      customTrigger(labelWrapper, 'mousedown', BUTTON_LEFT)
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        internalValue: [ 'a' ],
        isOpen: true,
        isFocused: false, // auto blur
      }))
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
      const { a } = vm.nodeMap

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
      const { a, aa } = vm.nodeMap

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
      const { a, aa } = vm.nodeMap

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
      const { a, aa, b, bb } = wrapper.vm.nodeMap

      expect(a.isExpanded).toBe(true)
      expect(aa.isExpanded).toBe(false)
      expect(b.isExpanded).toBe(false)
      expect(bb.isExpanded).toBe(true)
    })

    it('should request children options loading when expanded', () => {
      // TODO: 需要考虑服务端渲染的情况
      const loadChildrenOptions = jasmine.createSpy('loadChildrenOptions')
      const wrapper = mount(Treeselect, {
        propsData: {
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
          loadChildrenOptions,
        },
      })
      const { vm } = wrapper
      const { a } = vm.nodeMap

      expect(loadChildrenOptions.calls.count()).toBe(1)
      expect(loadChildrenOptions).toHaveBeenCalledWith(a.raw, jasmine.any(Function))
    })
  })

  describe('disableBranchNodes', () => {
    let wrapper, vm

    const getLabelWrapperOfBranchNode = () => {
      vm.openMenu() // ensure the menu is opened otherwise the options won't be displayed
      wrapper.update()
      const branchNode = wrapper.find(TreeselectOption)[0]
      expect(branchNode.vm.node.id).toBe('branch')
      return branchNode.first('.vue-treeselect__label-wrapper')
    }

    const getLabelWrapperOfLeafNode = () => {
      vm.openMenu() // ensure the menu is opened otherwise the options won't be displayed
      wrapper.update()
      const leafNode = wrapper.find(TreeselectOption)[1]
      expect(leafNode.vm.node.id).toBe('leaf')
      return leafNode.first('.vue-treeselect__label-wrapper')
    }

    const clickOnLabelOfBranchNode = () => {
      const labelWrapperOfBranchNode = getLabelWrapperOfBranchNode()
      customTrigger(labelWrapperOfBranchNode, 'mousedown', BUTTON_LEFT)
    }

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        attachToDocument: true,
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

    describe('when disableBranchNodes=false', () => {
      beforeEach(() => {
        wrapper.setProps({ disableBranchNodes: false })
      })

      it('a branch node should have checkbox when multiple=true', () => {
        wrapper.setProps({ multiple: true })
        const labelWrapperOfBranchNode = getLabelWrapperOfBranchNode()

        expect(labelWrapperOfBranchNode.contains('.vue-treeselect__checkbox')).toBe(true)
      })

      it('a leaf node should have checkbox too when multiple=true', () => {
        wrapper.setProps({ multiple: true })
        const labelWrapperOfLeafNode = getLabelWrapperOfLeafNode()

        expect(labelWrapperOfLeafNode.contains('.vue-treeselect__checkbox')).toBe(true)
      })

      it('click on label of a branch node should toggle checking state when multiple=true', () => {
        wrapper.setProps({ multiple: true })

        expect(vm.isSelected(vm.nodeMap.branch)).toBe(false)
        clickOnLabelOfBranchNode()
        expect(vm.isSelected(vm.nodeMap.branch)).toBe(true)
        clickOnLabelOfBranchNode()
        expect(vm.isSelected(vm.nodeMap.branch)).toBe(false)
      })

      it('click on label of a branch node should not toggle expanding state when multiple=true', () => {
        wrapper.setProps({ multiple: true })

        expect(vm.nodeMap.branch.isExpanded).toBe(true)
        clickOnLabelOfBranchNode()
        expect(vm.nodeMap.branch.isExpanded).toBe(true)
      })

      it('click on label of a branch node should close the dropdown when multiple=false & closeOnSelect=true', () => {
        wrapper.setProps({ multiple: false, closeOnSelect: true })
        vm.openMenu()
        wrapper.update()

        expect(vm.isOpen).toBe(true)
        clickOnLabelOfBranchNode()
        expect(vm.isOpen).toBe(false)
      })
    })

    describe('when disableBranchNodes=true', () => {
      beforeEach(() => {
        wrapper.setProps({ disableBranchNodes: true })
      })

      it('a branch node should not have checkbox when multiple=true', () => {
        wrapper.setProps({ multiple: true })
        const labelWrapperOfBranchNode = getLabelWrapperOfBranchNode()

        expect(labelWrapperOfBranchNode.contains('.vue-treeselect__checkbox')).toBe(false)
      })

      it('a leaf node should have checkbox when multiple=true', () => {
        wrapper.setProps({ multiple: true })
        const labelWrapperOfLeafNode = getLabelWrapperOfLeafNode()

        expect(labelWrapperOfLeafNode.contains('.vue-treeselect__checkbox')).toBe(true)
      })

      it('click on label of a branch node should not toggle checking state when multiple=true', () => {
        wrapper.setProps({ multiple: true })

        expect(vm.isSelected(vm.nodeMap.branch)).toBe(false)
        clickOnLabelOfBranchNode()
        expect(vm.isSelected(vm.nodeMap.branch)).toBe(false)
      })

      it('click on label of a branch node should toggle expanding state when multiple=true', () => {
        wrapper.setProps({ multiple: true })

        expect(vm.nodeMap.branch.isExpanded).toBe(true)
        clickOnLabelOfBranchNode()
        expect(vm.nodeMap.branch.isExpanded).toBe(false)
        clickOnLabelOfBranchNode()
        expect(vm.nodeMap.branch.isExpanded).toBe(true)
      })

      it('click on label of a branch node should not close the dropdown when multiple=false & closeOnSelect=true', () => {
        wrapper.setProps({ multiple: false, closeOnSelect: true })
        vm.openMenu()
        wrapper.update()

        expect(vm.isOpen).toBe(true)
        clickOnLabelOfBranchNode()
        expect(vm.isOpen).toBe(true)
      })

      it('should not auto-select ancestor nodes like flat-mode', () => {
        wrapper.setProps({ multiple: true })

        vm.select(vm.nodeMap.leaf)
        expect(vm.isSelected(vm.nodeMap.leaf)).toBe(true)
        expect(vm.isSelected(vm.nodeMap.branch)).toBe(false)
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

      expect(wrapper.contains('.vue-treeselect__input-wrapper')).toBe(true)
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

        expect(wrapper.contains('.vue-treeselect__input-wrapper')).toBe(true)
        expect(wrapper.contains('.vue-treeselect__input')).toBe(false)
      })

      it('should close the menu when setting disabled from false to true', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            options: [],
            disabled: false,
          },
        })

        wrapper.vm.openMenu()
        expect(wrapper.vm.isOpen).toBe(true)
        wrapper.setProps({ disabled: true })
        expect(wrapper.vm.isOpen).toBe(false)
      })

      it('the control should reject all clicks', () => {
        const wrapper = mount(Treeselect, {
          attachToDocument: true,
          propsData: {
            options: [],
            disabled: true,
          },
        })
        const valueWrapper = wrapper.first('.vue-treeselect__value-wrapper')

        customTrigger(valueWrapper, 'mousedown', BUTTON_LEFT)
        expect(wrapper.data()).toEqual(jasmine.objectContaining({
          isFocused: false,
          isOpen: false,
        }))
      })

      it('the control should be non-focusable', () => {
        const wrapper = mount(Treeselect, {
          attachToDocument: true,
          propsData: {
            options: [],
            disabled: true,
          },
        })

        wrapper.vm.focusInput()
        expect(wrapper.data()).toEqual(jasmine.objectContaining({
          isFocused: false,
        }))
      })

      it('should be uanble to open the menu', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            options: [],
            disabled: true,
          },
        })

        wrapper.vm.openMenu()
        expect(wrapper.data()).toEqual(jasmine.objectContaining({
          isOpen: false,
        }))
      })
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
      const { a, b, c, d } = vm.nodeMap

      expect(vm.internalValue).toEqual([ 'a', 'b', 'c', 'd' ])
      expect(vm.visibleValue).toEqual([ a, b, c, d ])
      expect(wrapper.find('.vue-treeselect__multi-value-item').length).toBe(4)
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
      const { a } = vm.nodeMap

      expect(vm.internalValue).toEqual([ 'a', 'b', 'c', 'd' ])
      expect(vm.visibleValue).toEqual([ a ])
      expect(wrapper.find('.vue-treeselect__multi-value-item').length).toBe(1)
      expect(wrapper.contains('.vue-treeselect__limit-tip')).toBe(true)
      expect(wrapper.first('.vue-treeselect__limit-tip').text()).toBe('and 3 more')
    })
  })

  describe('loadChildrenOptions', () => {
    it('should call loadChildrenOptions() to load children options when expanding an unloaded branch node', async done => {
      const loadChildrenOptions = jasmine.createSpy('loadChildrenOptions').and.callFake((parentNode, callback) => {
        expect(parentNode).toBe(a.raw)
        expect(callback).toBeFunction()
        expect(a.isPending).toBe(true)
        expect(a.isLoaded).toBe(false)
        const children = [ {
          id: 'aa',
          label: 'aa',
        } ]
        callback(null, children)
        expect(a.isPending).toBe(false)
        expect(a.isLoaded).toBe(true)
        expect(a.children.map(child => child.raw)).toEqual(children)
      })
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null, // declare an unloaded branch node
          } ],
          loadChildrenOptions,
        },
        data: {
          // it only auto loads children options when the option has been rendered to the DOM
          // so the menu must be open
          isOpen: true,
        },
      })
      const { vm } = wrapper
      const { a } = vm.nodeMap

      vm.toggleExpanded(a)
      await vm.$nextTick()
      expect(loadChildrenOptions).toHaveBeenCalled()
      done()
    })

    it('should accept empty results', async done => {
      const loadChildrenOptions = jasmine.createSpy('loadChildrenOptions').and.callFake((parentNode, callback) => {
        expect(a.isPending).toBe(true)
        expect(a.isLoaded).toBe(false)
        callback(null, [])
        expect(a.isPending).toBe(false)
        expect(a.isLoaded).toBe(true)
      })
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          loadChildrenOptions,
        },
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper
      const { a } = vm.nodeMap

      vm.toggleExpanded(a)
      await vm.$nextTick()
      expect(loadChildrenOptions).toHaveBeenCalled()
      done()
    })

    it('should be able to handle loading error', async done => {
      const loadChildrenOptions = jasmine.createSpy('loadChildrenOptions').and.callFake((parentNode, callback) => {
        expect(a.isPending).toBe(true)
        expect(a.isLoaded).toBe(false)
        const error = new Error('$ERROR$')
        callback(error)
        expect(a.isPending).toBe(false)
        expect(a.isLoaded).toBe(false)
        expect(a.loadingChildrenError).toBe(`Failed to load children options: ${error.message}.`)
      })
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          loadChildrenOptions,
        },
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper
      const { a } = vm.nodeMap

      vm.toggleExpanded(a)
      await vm.$nextTick()
      expect(loadChildrenOptions).toHaveBeenCalled()
      done()
    })

    it('should be able to recover from loading error', async done => {
      let c = 0
      const loadChildrenOptions = jasmine.createSpy('loadChildrenOptions').and.callFake((parentNode, callback) => {
        if (c === 0) {
          const error = new Error('$ERROR$')
          callback(error)
          expect(a.loadingChildrenError).toBe(`Failed to load children options: ${error.message}.`)
        } else if (c === 1) {
          expect(a.isPending).toBe(true)
          expect(a.isLoaded).toBe(false)
          callback(null, [ {
            id: 'aa',
            label: 'aa',
          } ])
          expect(a.isPending).toBe(false)
          expect(a.isLoaded).toBe(true)
          expect(a.children).toBeNonEmptyArray()
          expect(a.loadingChildrenError).toBe('')
        } else {
          throw new Error('unknown error')
        }

        c++
      })
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          loadChildrenOptions,
        },
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper
      const { a } = vm.nodeMap

      // expand
      vm.toggleExpanded(a)
      await vm.$nextTick()
      expect(loadChildrenOptions.calls.count()).toBe(1)

      // collapse
      vm.toggleExpanded(a)
      await vm.$nextTick()

      // expand again
      vm.toggleExpanded(a)
      await vm.$nextTick()
      expect(loadChildrenOptions.calls.count()).toBe(2)

      done()
    })

    it('should warn about the absent of `loadChildrenOptions` prop when unloaded branch nodes detected', () => {
      spyOn(console, 'error')

      mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'id',
            label: 'label',
            children: null,
          } ],
        },
      })

      expect(console.error).toHaveBeenCalledWith(
        '[Vue-Treeselect Warning]',
        'Unloaded branch node detected. `loadChildrenOptions` prop is required to load its children.',
      )
    })

    it('shoud error if received data is not an array', async done => {
      spyOn(console, 'error')

      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          loadChildrenOptions(parentNode, callback) {
            callback(null, /* non-arry */ null)
          },
        },
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper

      vm.toggleExpanded(vm.nodeMap.a)
      await vm.$nextTick()
      expect(vm.nodeMap.a.loadingChildrenError).toBe('Received unrecognizable data')
      expect(console.error).toHaveBeenCalledWith(
        '[Vue-Treeselect Warning]',
        'Received unrecognizable data null while loading children options of node a'
      )
      done()
    })

    it('should avoid of calling `loadChildrenOptions()` when an in-flight request is unfinished', async done => {
      jasmine.clock().install()

      const DELAY = 200
      const ERROR_MSG = '$ERROR_MSG$'
      const loadChildrenOptions = jasmine.createSpy('loadChildrenOptions', (parentNode, callback) => {
        setTimeout(() => callback(new Error(ERROR_MSG)), DELAY)
      }).and.callThrough()
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          loadChildrenOptions,
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()

      expect(loadChildrenOptions).not.toHaveBeenCalled()
      vm.toggleExpanded(vm.nodeMap.a)
      await vm.$nextTick()
      expect(vm.nodeMap.a).toEqual(jasmine.objectContaining({
        isExpanded: true,
        isPending: true,
      }))
      expect(loadChildrenOptions.calls.count()).toBe(1)

      vm.toggleExpanded(vm.nodeMap.a)
      await vm.$nextTick()
      expect(vm.nodeMap.a.isExpanded).toBe(false)

      vm.toggleExpanded(vm.nodeMap.a)
      await vm.$nextTick()
      expect(vm.nodeMap.a.isExpanded).toBe(true)
      expect(loadChildrenOptions.calls.count()).toBe(1)

      jasmine.clock().tick(DELAY + 1)
      expect(vm.nodeMap.a).toEqual(jasmine.objectContaining({
        isExpanded: true,
        isPending: false,
        loadingChildrenError: `Failed to load children options: ${ERROR_MSG}.`,
      }))

      vm.toggleExpanded(vm.nodeMap.a)
      await vm.$nextTick()
      expect(vm.nodeMap.a.isExpanded).toBe(false)

      vm.toggleExpanded(vm.nodeMap.a)
      await vm.$nextTick()
      expect(loadChildrenOptions.calls.count()).toBe(2)
      expect(vm.nodeMap.a).toEqual(jasmine.objectContaining({
        isExpanded: true,
        isPending: true,
      }))

      jasmine.clock().uninstall()
      done()
    })
  })

  describe('loadRootOptions', () => {
    it('should call loadRootOptions() to load root options when opening the menu', () => {
      jasmine.clock().install()

      const DELAY = 100
      const loadRootOptions = jasmine.createSpy('loadRootOptions', callback => {
        const rootOptions = [ {
          id: 'a',
          label: 'a',
        } ]
        setTimeout(() => callback(null, rootOptions), DELAY)
      }).and.callThrough()
      const wrapper = mount(Treeselect, {
        propsData: {
          loadRootOptions,
        },
      })
      const { vm } = wrapper

      expect(vm.rootOptionsLoaded).toBe(false)
      vm.openMenu()
      expect(loadRootOptions).toHaveBeenCalled()
      expect(vm.loadingRootOptions).toBe(true)

      jasmine.clock().tick(DELAY + 1)
      expect(vm.rootOptionsLoaded).toBe(true)
      expect(vm.loadingRootOptions).toBe(false)
      expect(vm.normalizedOptions.length).toBe(1)
      expect(vm.nodeMap.a).toBeObject()

      jasmine.clock().uninstall()
    })

    it('should accept empty array & be able to handle loading error', () => {
      jasmine.clock().install()

      const DELAY = 100
      const ERROR_MSG = '$ERROR_MSG$'
      let called = false
      const loadRootOptions = jasmine.createSpy('loadRootOptions', callback => {
        if (called) {
          setTimeout(() => callback(null, []), DELAY)
        } else {
          called = true
          setTimeout(() => callback(new Error(ERROR_MSG)), DELAY)
        }
      }).and.callThrough()
      const wrapper = mount(Treeselect, {
        propsData: {
          loadRootOptions,
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      jasmine.clock().tick(DELAY + 1)
      expect(vm.loadingRootOptionsError).toBe(ERROR_MSG)

      vm.closeMenu()
      vm.openMenu()
      jasmine.clock().tick(DELAY + 1)
      expect(vm.loadingRootOptionsError).toBe('')
      expect(vm.rootOptionsLoaded).toBe(true)

      jasmine.clock().uninstall()
    })

    describe('should be able to handle invalid data', () => {
      let wrapper, value, expectedError

      beforeEach(() => {
        wrapper = mount(Treeselect, {
          propsData: {
            loadRootOptions(callback) {
              callback(null, value)
            },
          },
        })
      })

      afterEach(() => {
        wrapper.vm.openMenu()
        expect(wrapper.data()).toEqual(jasmine.objectContaining({
          loadingRootOptions: false,
          loadingRootOptionsError: expectedError,
          rootOptionsLoaded: false,
        }))
      })

      it('falsy value', () => {
        value = null
        expectedError = 'no data received'
      })

      it('non-array value', () => {
        value = {}
        expectedError = 'received unrecognizable data'
      })
    })

    it('should avoid calling `loadingRootOptions` when an in-flight request is unfinished', () => {
      const loadRootOptions = jasmine.createSpy('loadRootOptions')
      const wrapper = mount(Treeselect, {
        propsData: {
          loadRootOptions,
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      expect(loadRootOptions.calls.count()).toBe(1)

      vm.closeMenu()
      vm.openMenu()
      expect(loadRootOptions.calls.count()).toBe(1)
    })
  })

  describe('openOnClick', () => {
    it('when openOnClick=false', () => {
      const wrapper = mount(Treeselect, {
        attachToDocument: true,
        propsData: {
          options: [],
          openOnClick: false,
        },
      })
      const valueWrapper = wrapper.first('.vue-treeselect__value-wrapper')

      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        isFocused: false,
        isOpen: false,
      }))

      customTrigger(valueWrapper, 'mousedown', BUTTON_LEFT)
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        isFocused: true,
        isOpen: false,
      }))

      customTrigger(valueWrapper, 'mousedown', BUTTON_LEFT)
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        isFocused: true,
        isOpen: true,
      }))
    })

    it('when openOnClick=true', () => {
      const wrapper = mount(Treeselect, {
        attachToDocument: true,
        propsData: {
          options: [],
          openOnClick: true,
        },
      })
      const valueWrapper = wrapper.first('.vue-treeselect__value-wrapper')

      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        isFocused: false,
        isOpen: false,
      }))

      customTrigger(valueWrapper, 'mousedown', BUTTON_LEFT)
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        isFocused: true,
        isOpen: true,
      }))
    })
  })

  describe('openOnFocus', () => {
    it('when openOnFocus=false', () => {
      const wrapper = mount(Treeselect, {
        attachToDocument: true,
        propsData: {
          options: [],
          openOnFocus: false,
        },
      })
      const valueWrapper = wrapper.first('.vue-treeselect__value-wrapper')

      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        isFocused: false,
        isOpen: false,
      }))

      wrapper.vm.focusInput()
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        isFocused: true,
        isOpen: false,
      }))

      customTrigger(valueWrapper, 'mousedown', BUTTON_LEFT)
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        isFocused: true,
        isOpen: true,
      }))
    })

    it('when openOnFocus=true', () => {
      const wrapper = mount(Treeselect, {
        attachToDocument: true,
        propsData: {
          options: [],
          openOnFocus: true,
        },
      })

      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        isFocused: false,
        isOpen: false,
      }))

      wrapper.vm.focusInput()
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        isFocused: true,
        isOpen: true,
      }))
    })

    describe('combined with autofocus', () => {
      it('when openOnFocus=false', () => {
        const wrapper = mount(Treeselect, {
          attachToDocument: true,
          propsData: {
            options: [],
            autofocus: true,
            openOnFocus: false,
          },
        })

        expect(wrapper.data()).toEqual(jasmine.objectContaining({
          isFocused: true,
          isOpen: false,
        }))
      })

      it('when openOnFocus=true', () => {
        const wrapper = mount(Treeselect, {
          attachToDocument: true,
          propsData: {
            options: [],
            autofocus: true,
            openOnFocus: true,
          },
        })

        expect(wrapper.data()).toEqual(jasmine.objectContaining({
          isFocused: true,
          isOpen: true,
        }))
      })
    })
  })

  describe('options', () => {
    it('should warn about being absent', () => {
      spyOn(console, 'error')

      mount(Treeselect, {
        propsData: {
          options: null,
        },
      })

      expect(console.error).toHaveBeenCalledWith(
        '[Vue-Treeselect Warning]',
        'Required prop `options` is not provided.'
      )
    })

    it('should warn about non-array prop value', () => {
      spyOn(console, 'error')

      mount(Treeselect, {
        propsData: {
          options: {},
        },
      })

      expect(console.error).toHaveBeenCalledWith(
        '[Vue-Treeselect Warning]',
        'Expected prop `options` to be an array, instead got: [object Object].'
      )
    })

    it('can be omitted when `loadRootOptions` prop provided', () => {
      spyOn(console, 'error')

      mount(Treeselect, {
        propsData: {
          loadRootOptions() { /* empty */ },
        },
      })

      expect(console.error).not.toHaveBeenCalled()
    })

    it('show tip when `options` is an empty array', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
        },
        data: {
          isOpen: true,
        },
      })

      const menu = wrapper.first('.vue-treeselect__menu')
      const noOptionsTip = menu.first('.vue-treeselect__no-options-tip')
      expect(noOptionsTip.text().trim()).toBe('No options available.')
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

          expect(wrapper.contains('.vue-treeselect__input-wrapper .vue-treeselect__input')).toBe(true)
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

          expect(wrapper.contains('.vue-treeselect__input-wrapper .vue-treeselect__input')).toBe(true)
        })
      })

      it('entering search query', async done => {
        const wrapper = mount(Treeselect, {
          propsData: {
            searchable: true,
            options: [],
          },
        })

        expect(wrapper.data()).toEqual(jasmine.objectContaining({
          searching: false,
          searchQuery: '',
        }))

        await typeSearchText(wrapper, '$SEARCH_QUERY$')
        expect(wrapper.data()).toEqual(jasmine.objectContaining({
          searching: true,
          searchQuery: '$SEARCH_QUERY$',
        }))

        await typeSearchText(wrapper, '')
        expect(wrapper.data()).toEqual(jasmine.objectContaining({
          searching: false,
          searchQuery: '',
        }))

        done()
      })

      it('filtering', async done => {
        const wrapper = mount(Treeselect, {
          propsData: {
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
          data: {
            isOpen: true,
          },
        })

        expect(wrapper.data()).toEqual(jasmine.objectContaining({
          noSearchResults: true,
        }))

        await typeSearchText(wrapper, 'b')
        expect(wrapper.data()).toEqual(jasmine.objectContaining({
          noSearchResults: false,
        }))

        const expectedMatchedNodeIds = [ 'ab', 'b' ]
        const optionWrappers = wrapper.find(TreeselectOption)
        expect(optionWrappers.length).toBe(4)
        optionWrappers.forEach(optionWrapper => {
          const { node } = optionWrapper.instance()
          expect(node.isMatched).toBe(expectedMatchedNodeIds.indexOf(node.id) !== -1)
        })

        done()
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

          expect(wrapper.contains('.vue-treeselect__input-wrapper')).toBe(true)
          expect(wrapper.first('.vue-treeselect__input-wrapper').isEmpty()).toBe(true)
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

          expect(wrapper.contains('.vue-treeselect__input-wrapper')).toBe(true)
          expect(wrapper.first('.vue-treeselect__input-wrapper').isEmpty()).toBe(true)
        })
      })
    })
  })

  describe('sortValueBy', () => {
    function createArray(len, fn) {
      const arr = []
      let i = 0
      while (i < len) arr.push(fn(i++))
      return arr
    }

    function generateOptions(max) {
      return (function generate(parent) {
        return createArray(max, i => {
          const id = parent + String.fromCharCode(97 + i)
          const curr = { id, label: id }
          if (id.length < max) curr.children = generate(id)
          return curr
        })
      })('')
    }

    it('when sortValueBy="ORDER_SELECTED"', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          multiple: true,
          options: generateOptions(4),
          sortValueBy: 'ORDER_SELECTED',
        },
      })
      const { vm } = wrapper
      const { a, bb, ccc, dddd } = vm.nodeMap

      expect(vm.internalValue).toEqual([])
      vm.select(bb)
      expect(vm.internalValue).toEqual([ 'bb' ])
      vm.select(a)
      expect(vm.internalValue).toEqual([ 'bb', 'a' ])
      vm.select(dddd)
      expect(vm.internalValue).toEqual([ 'bb', 'a', 'dddd' ])
      vm.select(ccc)
      expect(vm.internalValue).toEqual([ 'bb', 'a', 'dddd', 'ccc' ])
    })

    it('when sortValueBy="LEVEL"', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          multiple: true,
          options: generateOptions(4),
          sortValueBy: 'LEVEL',
        },
      })
      const { vm } = wrapper
      const { aaa, ab, bb, c, dddd } = vm.nodeMap

      expect(vm.internalValue).toEqual([])
      vm.select(bb)
      expect(vm.internalValue).toEqual([ 'bb' ])
      vm.select(aaa)
      expect(vm.internalValue).toEqual([ 'bb', 'aaa' ])
      vm.select(dddd)
      expect(vm.internalValue).toEqual([ 'bb', 'aaa', 'dddd' ])
      vm.select(c)
      expect(vm.internalValue).toEqual([ 'c', 'bb', 'aaa', 'dddd' ])
      vm.select(ab)
      expect(vm.internalValue).toEqual([ 'c', 'ab', 'bb', 'aaa', 'dddd' ])
    })

    it('when sortValueBy="INDEX"', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          multiple: true,
          options: generateOptions(4),
          sortValueBy: 'INDEX',
        },
      })
      const { vm } = wrapper
      const { aaaa, bbb, cc, d } = vm.nodeMap

      expect(vm.internalValue).toEqual([])
      vm.select(d)
      expect(vm.internalValue).toEqual([ 'd' ])
      vm.select(bbb)
      expect(vm.internalValue).toEqual([ 'bbb', 'd' ])
      vm.select(aaaa)
      expect(vm.internalValue).toEqual([ 'aaaa', 'bbb', 'd' ])
      vm.select(cc)
      expect(vm.internalValue).toEqual([ 'aaaa', 'bbb', 'cc', 'd' ])
    })

    it('should re-sort value immediately after component gets initialized', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          multiple: true,
          options: generateOptions(4),
          sortValueBy: 'LEVEL',
          value: [ 'aaa', 'bb', 'c' ],
        },
      })
      const { vm } = wrapper

      expect(vm.internalValue).toEqual([ 'c', 'bb', 'aaa' ])
    })

    it('should re-sort value after prop value changes', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          multiple: true,
          options: generateOptions(4),
          sortValueBy: 'LEVEL',
          value: [ 'aaa', 'bb', 'c' ],
        },
      })

      expect(wrapper.vm.internalValue).toEqual([ 'c', 'bb', 'aaa' ])
      wrapper.setProps({ sortValueBy: 'INDEX' })
      expect(wrapper.vm.internalValue).toEqual([ 'aaa', 'bb', 'c' ])
      wrapper.setProps({ sortValueBy: 'LEVEL' })
      expect(wrapper.vm.internalValue).toEqual([ 'c', 'bb', 'aaa' ])
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

      const $inputWrapper = wrapper.first('.vue-treeselect__input-wrapper')
      const $input = wrapper.first('.vue-treeselect__input')
      expect($inputWrapper.hasAttribute('tabindex')).toBe(false)
      expect($input.hasAttribute('tabindex')).toBe(true)
    })

    it('when disabled=false & searchable=false', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          searchable: false,
          disabled: false,
        },
      })

      const $inputWrapper = wrapper.first('.vue-treeselect__input-wrapper')
      expect($inputWrapper.hasAttribute('tabindex')).toBe(true)
    })

    it('when disabled=true', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          disabled: true,
        },
      })

      const $inputWrapper = wrapper.first('.vue-treeselect__input-wrapper')
      expect($inputWrapper.hasAttribute('tabindex')).toBe(false)
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

      const $input = wrapper.first('.vue-treeselect__input')
      expect($input.getAttribute('tabindex')).toBe('1')
    })
  })
})

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
        autofocus: false,
      },
    })

    expect(wrapper.data().isFocused).toBe(false)
    wrapper.vm.focusInput()
    expect(wrapper.data().isFocused).toBe(true)
    wrapper.vm.blurInput()
    expect(wrapper.data().isFocused).toBe(false)
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

describe('Events', () => {
  // TODO
})
