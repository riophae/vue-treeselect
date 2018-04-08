import Vue from 'vue'
import { mount } from 'avoriaz'
import sleep from 'yaku/lib/sleep'
import Treeselect from '@riophae/vue-treeselect/components/Treeselect'
import TreeselectOption from '@riophae/vue-treeselect/components/Option'
import SearchInput from '@riophae/vue-treeselect/components/SearchInput'
import { UNCHECKED, INDETERMINATE, CHECKED, INPUT_DEBOUNCE_DELAY } from '@riophae/vue-treeselect/constants'

const BUTTON_LEFT = { button: 0 }
const KEY_BACKSPACE = { which: 8, keyCode: 8 }
const KEY_DELETE = { which: 46, keyCode: 46 }
const KEY_ESCAPE = { which: 27, keyCode: 27 }
const KEY_A = { which: 65, keyCode: 65 }

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
  await sleep(INPUT_DEBOUNCE_DELAY + 10)
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
        lowerCasedLabel: jasmine.any(String),
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
        lowerCasedLabel: jasmine.any(String),
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

    it('lowerCasedLabel', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'A',
          } ],
        },
      })
      const { vm } = wrapper

      expect(vm.nodeMap.a.label).toBe('A')
      expect(vm.nodeMap.a.lowerCasedLabel).toBe('a')
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

      expect(a.isExpanded).toBe(true)
      expect(b.isExpanded).toBe(false)
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

  describe('fallback node', () => {
    it('shape', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
        },
      })
      const { vm } = wrapper

      expect(vm.nodeMap).toBeEmptyObject()
      wrapper.setProps({ value: 'test' })
      expect(vm.nodeMap.test).toEqual({
        id: jasmine.any(String),
        label: jasmine.any(String),
        ancestors: [],
        parentNode: null,
        isFallbackNode: true,
        isRootNode: true,
        isLeaf: true,
        isBranch: false,
        isDisabled: false,
        index: [ -1 ],
        level: 0,
        raw: {
          id: 'test',
        },
      })
    })

    describe('label', () => {
      it('extract label from value object', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            value: {
              id: 'id',
              label: 'label',
            },
            options: [],
            valueFormat: 'object',
          },
        })
        const { vm } = wrapper

        expect(vm.nodeMap.id).toEqual(jasmine.objectContaining({
          id: 'id',
          label: 'label',
          isFallbackNode: true,
        }))
      })

      it('default label', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            value: 'a',
            options: [],
          },
        })
        const { vm } = wrapper

        expect(vm.nodeMap.a).toEqual(jasmine.objectContaining({
          id: 'a',
          label: 'a (unknown)',
          isFallbackNode: true,
        }))
      })
    })
  })

  it('should accept undefined/null as value', () => {
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

        expect(vm.selectedNodeIds).toBeEmptyArray()
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

  it('fallback nodes should not be considered duplicate', () => {
    jasmine.clock().install()
    spyOn(console, 'error')

    const DELAY = 200
    mount(Treeselect, {
      propsData: {
        value: 'a',
        loadRootOptions(callback) {
          setTimeout(() => {
            callback(null, [ {
              id: 'a',
              label: 'a',
            } ])
          }, DELAY)
        },
      },
    })

    jasmine.clock().tick(DELAY + 1)
    expect(console.error).not.toHaveBeenCalled()

    jasmine.clock().uninstall()
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
    const labelWrapper = wrapper.first(TreeselectOption).first('.vue-treeselect__label-wrapper')

    customTrigger(labelWrapper, 'mousedown', BUTTON_LEFT)
    expect(wrapper.data()).toEqual(jasmine.objectContaining({
      selectedNodeIds: [ 'a' ],
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
      selectedNodeIds: [ 'b' ],
    }))

    customTrigger(secondRemove, 'mousedown', BUTTON_LEFT)
    expect(wrapper.data()).toEqual(jasmine.objectContaining({
      isOpen: true,
      selectedNodeIds: [],
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
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a', 'b' ])
    })

    it('should remove the last value if search input is empty', () => {
      customTrigger(input, 'keydown', KEY_BACKSPACE)
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a' ])
      customTrigger(input, 'keydown', KEY_BACKSPACE)
      expect(wrapper.vm.selectedNodeIds).toEqual([])
    })

    it('should do nothing if search input has value', async done => {
      await typeSearchText(wrapper, 'test')
      expect(wrapper.vm.searchQuery).toBe('test')
      customTrigger(input, 'keydown', KEY_BACKSPACE)
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a', 'b' ])
      done()
    })

    it('should do nothing when backspaceRemoves=false', () => {
      wrapper.setProps({ backspaceRemoves: false })
      customTrigger(input, 'keydown', KEY_BACKSPACE)
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a', 'b' ])
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
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a', 'b' ])
    })

    it('should remove the last value if search input is empty', () => {
      customTrigger(input, 'keydown', KEY_DELETE)
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a' ])
      customTrigger(input, 'keydown', KEY_DELETE)
      expect(wrapper.vm.selectedNodeIds).toEqual([])
    })

    it('should do nothing if search input has value', async done => {
      await typeSearchText(wrapper, 'test')
      expect(wrapper.vm.searchQuery).toBe('test')
      customTrigger(input, 'keydown', KEY_DELETE)
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a', 'b' ])
      done()
    })

    it('should do nothing when backspaceRemoves=false', () => {
      wrapper.setProps({ deleteRemoves: false })
      customTrigger(input, 'keydown', KEY_DELETE)
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a', 'b' ])
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
        selectedNodeIds: [ 'a', 'b' ],
      }))
      done()
    })

    it('should close the menu if input is empty', () => {
      wrapper.vm.openMenu()
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        searchQuery: '',
        selectedNodeIds: [ 'a', 'b' ],
      }))
      customTrigger(input, 'keydown', KEY_ESCAPE)
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        searchQuery: '',
        selectedNodeIds: [ 'a', 'b' ],
        isOpen: false,
      }))
    })

    it('should reset value if menu is closed', () => {
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        searchQuery: '',
        selectedNodeIds: [ 'a', 'b' ],
        isOpen: false,
      }))
      customTrigger(input, 'keydown', KEY_ESCAPE)
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        searchQuery: '',
        selectedNodeIds: [],
        isOpen: false,
      }))
    })

    it('should not reset value when escapeClearsValue=false', () => {
      wrapper.setProps({ escapeClearsValue: false })
      customTrigger(input, 'keydown', KEY_ESCAPE)
      expect(wrapper.data()).toEqual(jasmine.objectContaining({
        searchQuery: '',
        selectedNodeIds: [ 'a', 'b' ],
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
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a' ])
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
      expect(wrapper.contains('.vue-treeselect__x')).toBe(true)
    })

    it('should reset value on mousedown', () => {
      expect(wrapper.vm.selectedNodeIds).toEqual([ 'a' ])
      customTrigger(wrapper.first('.vue-treeselect__x'), 'mousedown', BUTTON_LEFT)
      expect(wrapper.vm.selectedNodeIds).toEqual([])
    })

    it('should hide when no options selected', () => {
      wrapper.vm.clear()
      wrapper.update()
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

      expect(wrapper.first('.vue-treeselect__x').getAttribute('title')).toBe('$MULTI_TITLE$')
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

      expect(wrapper.first('.vue-treeselect__x').getAttribute('title')).toBe('$SINGLE_TITLE$')
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
        selectedNodeIds: [ 'a' ],
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
        selectedNodeIds: [ 'a' ],
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

    it('when disableFuzzyMatching=false', async done => {
      wrapper.setProps({ disableFuzzyMatching: false })
      await typeSearchText(wrapper, 'jb')
      expect(vm.nodeMap.jamesblunt.isMatched).toBe(true)
      done()
    })

    it('when disableFuzzyMatching=true', async done => {
      wrapper.setProps({ disableFuzzyMatching: true })
      await typeSearchText(wrapper, 'jb')
      expect(vm.nodeMap.jamesblunt.isMatched).toBe(false)
      done()
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

      expect(vm.selectedNodeIds).toEqual([ 'a', 'b', 'c', 'd' ])
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

      expect(vm.selectedNodeIds).toEqual([ 'a', 'b', 'c', 'd' ])
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

    it('should override fallback nodes', async done => {
      jasmine.clock().install()

      const DELAY = 200
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          value: 'aa',
          loadChildrenOptions(parentNode, callback) {
            setTimeout(() => {
              callback(null, [ {
                id: 'aa',
                label: 'aa',
              }, {
                id: 'ab',
                label: 'ab',
              } ])
            }, DELAY)
          },
        },
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper
      // eslint-disable-next-line newline-per-chained-call
      const getValueText = () => wrapper.first('.vue-treeselect__single-value').text().trim()

      expect(vm.nodeMap.aa).toEqual(jasmine.objectContaining({
        id: 'aa',
        label: 'aa (unknown)',
        isFallbackNode: true,
      }))
      expect(getValueText()).toBe('aa (unknown)')

      expect(vm.nodeMap.a.isLoaded).toBe(false)
      vm.toggleExpanded(vm.nodeMap.a)
      await vm.$nextTick()
      expect(vm.nodeMap.a.isPending).toBe(true)

      jasmine.clock().tick(DELAY + 1)
      await vm.$nextTick()
      expect(vm.nodeMap.a.isLoaded).toBe(true)
      expect(vm.nodeMap.aa).toEqual(jasmine.objectContaining({
        id: 'aa',
        label: 'aa',
      }))
      expect(getValueText()).toBe('aa')

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

    it('should avoid calling `loadingRootOptions` when an in-flight request is incomplete', () => {
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

    it('should override fallback nodes', () => {
      // the same with `loadChildrenOptions`
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

      expect(vm.nodeMap.a).toEqual(jasmine.objectContaining({
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

      expect(vm.selectedNodeIds).toEqual([ 'a' ])
      expect(vm.nodeMap.a).toEqual(jasmine.objectContaining({
        id: 'a',
        label: 'a',
        isFallbackNode: true,
        raw: {
          key: 'a',
          name: 'a',
        },
      }))
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

  it('showCount', () => {
    // TODO
  })

  describe('showCountOnSearch', () => {
    let wrapper

    beforeEach(() => {
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
        data: {
          isOpen: true,
        },
      })
    })

    it('when showCountOnSearch=false', async done => {
      wrapper.setProps({ showCountOnSearch: false })

      await typeSearchText(wrapper, 'a')
      expect(wrapper.contains('.vue-treeselect__count')).toBe(false)

      done()
    })

    it('when showCountOnSearch=true', async done => {
      wrapper.setProps({ showCountOnSearch: true })

      await typeSearchText(wrapper, 'a')
      expect(wrapper.contains('.vue-treeselect__count')).toBe(true)

      done()
    })

    it('when showCountOnSearch not specified', async done => {
      await typeSearchText(wrapper, 'a')
      expect(wrapper.contains('.vue-treeselect__count')).toBe(true)

      done()
    })

    it('should refresh count number after search changes', async done => {
      wrapper.setProps({ showCountOnSearch: true })

      const options = wrapper.find(TreeselectOption)
      expect(options[0].vm.node.id).toBe('a')
      expect(options[1].vm.node.id).toBe('b')

      await typeSearchText(wrapper, 'a')
      expect(options[0].first('.vue-treeselect__count').text()).toEqual('(2)')
      expect(options[1].first('.vue-treeselect__count').text()).toEqual('(1)')

      await typeSearchText(wrapper, 'b')
      expect(options[0].first('.vue-treeselect__count').text()).toEqual('(1)')
      expect(options[1].first('.vue-treeselect__count').text()).toEqual('(2)')

      done()
    })
  })

  describe('sortValueBy', () => {
    let wrapper, vm

    function createArray(len, fn) {
      const arr = []
      let i = 0
      while (i < len) arr.push(fn(i++))
      return arr
    }

    function generateOptions(maxLevel) {
      const generate = (i, level) => {
        const id = String.fromCharCode(97 + i).repeat(level)
        const option = { id, label: id.toUpperCase() }
        if (level < maxLevel) option.children = [ generate(i, level + 1) ]
        return option
      }

      return createArray(maxLevel, i => generate(i, 1))
    }

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

      vm.select(vm.nodeMap.bb)
      expect(vm.internalValue).toEqual([ 'bb' ])
      vm.select(vm.nodeMap.a)
      expect(vm.internalValue).toEqual([ 'bb', 'a' ])
      vm.select(vm.nodeMap.dddd)
      expect(vm.internalValue).toEqual([ 'bb', 'a', 'dddd' ])
      vm.select(vm.nodeMap.ccc)
      expect(vm.internalValue).toEqual([ 'bb', 'a', 'dddd', 'ccc' ])
    })

    it('when sortValueBy="LEVEL"', () => {
      wrapper.setProps({ sortValueBy: 'LEVEL' })

      vm.select(vm.nodeMap.bb)
      expect(vm.internalValue).toEqual([ 'bb' ])
      vm.select(vm.nodeMap.aaa)
      expect(vm.internalValue).toEqual([ 'bb', 'aaa' ])
      vm.select(vm.nodeMap.dddd)
      expect(vm.internalValue).toEqual([ 'bb', 'aaa', 'dddd' ])
      vm.select(vm.nodeMap.c)
      expect(vm.internalValue).toEqual([ 'c', 'bb', 'aaa', 'dddd' ])
      vm.select(vm.nodeMap.aa)
      expect(vm.internalValue).toEqual([ 'c', 'aa', 'bb', 'aaa', 'dddd' ])
    })

    it('when sortValueBy="INDEX"', () => {
      wrapper.setProps({ sortValueBy: 'INDEX' })

      vm.select(vm.nodeMap.d)
      expect(vm.internalValue).toEqual([ 'd' ])
      vm.select(vm.nodeMap.bbb)
      expect(vm.internalValue).toEqual([ 'bbb', 'd' ])
      vm.select(vm.nodeMap.aaaa)
      expect(vm.internalValue).toEqual([ 'aaaa', 'bbb', 'd' ])
      vm.select(vm.nodeMap.cc)
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

  describe('valueConsistsOf', () => {
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
          } ],
          value: [ 'aa' ],
        },
      })
      vm = wrapper.vm
    })

    it('when valueConsistsOf=ALL', () => {
      wrapper.setProps({ valueConsistsOf: 'ALL' })

      expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab' ])
      vm.select(vm.nodeMap.ab)
      expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab', 'ab', 'aba', 'abb' ])
      vm.select(vm.nodeMap.ac)
      expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab', 'ab', 'aba', 'abb', 'ac', 'a' ])
    })

    it('when valueConsistsOf=BRANCH_PRIORITY', () => {
      wrapper.setProps({ valueConsistsOf: 'BRANCH_PRIORITY' })

      expect(vm.internalValue).toEqual([ 'aa' ])
      vm.select(vm.nodeMap.ab)
      expect(vm.internalValue).toEqual([ 'aa', 'ab' ])
      vm.select(vm.nodeMap.ac)
      expect(vm.internalValue).toEqual([ 'a' ])
    })

    it('when valueConsistsOf=LEAF_PRIORITY', () => {
      wrapper.setProps({ valueConsistsOf: 'LEAF_PRIORITY' })

      expect(vm.internalValue).toEqual([ 'aaa', 'aab' ])
      vm.select(vm.nodeMap.ab)
      expect(vm.internalValue).toEqual([ 'aaa', 'aab', 'aba', 'abb' ])
      vm.select(vm.nodeMap.ac)
      expect(vm.internalValue).toEqual([ 'aaa', 'aab', 'aba', 'abb', 'ac' ])
    })
  })

  describe('valueFormat', () => {
    describe('when valueFormat=id', () => {
      it('single-select', async done => {
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

        expect(comp.selectedNodeIds).toEqual([ 'a' ])

        comp.select(comp.nodeMap.b)
        await comp.$nextTick()
        expect(comp.selectedNodeIds).toEqual([ 'b' ])
        expect(vm.value).toEqual('b')

        done()
      })

      it('multi-select', async done => {
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

        expect(comp.selectedNodeIds).toEqual([ 'a' ])

        comp.select(comp.nodeMap.b)
        await comp.$nextTick()
        expect(comp.selectedNodeIds).toEqual([ 'a', 'b' ])
        expect(vm.value).toEqual([ 'a', 'b' ])

        done()
      })
    })

    describe('when valueFormat=object', () => {
      it('single-select', async done => {
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

        expect(comp.selectedNodeIds).toEqual([ 'a' ])

        comp.select(comp.nodeMap.b)
        await comp.$nextTick()
        expect(comp.selectedNodeIds).toEqual([ 'b' ])
        expect(vm.value).toEqual({
          id: 'b',
          label: 'b',
        })

        done()
      })

      it('multi-select', async done => {
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

        expect(comp.selectedNodeIds).toEqual([ 'a' ])

        comp.select(comp.nodeMap.b)
        await comp.$nextTick()
        expect(comp.selectedNodeIds).toEqual([ 'a', 'b' ])
        expect(vm.value).toEqual([ {
          id: 'a',
          label: 'a',
        }, {
          id: 'b',
          label: 'b',
        } ])

        done()
      })

      it('should return raw node object', async done => {
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

        expect(comp.selectedNodeIds).toEqual([ 'a' ])

        comp.select(comp.nodeMap.b)
        await comp.$nextTick()
        expect(vm.value).toEqual({
          id: 'b',
          label: 'b',
          _extra: 'b',
        })

        done()
      })
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
