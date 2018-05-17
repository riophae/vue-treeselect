import Vue from 'vue'
import { mount } from '@vue/test-utils'
import sleep from 'yaku/lib/sleep'
import Treeselect from '@riophae/vue-treeselect/components/Treeselect'
import TreeselectOption from '@riophae/vue-treeselect/components/Option'

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
        nestedSearchLabel: jasmine.any(String),
        isLeaf: jasmine.any(Boolean),
        isBranch: jasmine.any(Boolean),
        isRootNode: jasmine.any(Boolean),
        isExpanded: jasmine.any(Boolean),
        isMatched: jasmine.any(Boolean),
        isDisabled: jasmine.any(Boolean),
        isLoaded: jasmine.any(Boolean),
        isPending: jasmine.any(Boolean),
        hasMatchedDescendants: jasmine.any(Boolean),
        hasDisabledDescendants: jasmine.any(Boolean),
        isExpandedOnSearch: jasmine.any(Boolean),
        showAllChildrenOnSearch: jasmine.any(Boolean),
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
        nestedSearchLabel: jasmine.any(String),
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
      const options = [ {
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
      } ]

      const whenNonFlatMode = vm => {
        const { a, aa, b, ba, bb, c, ca, caa } = vm.nodeMap

        expect(a.isDisabled).toBe(true)
        expect(aa.isDisabled).toBe(true)
        expect(b.isDisabled).toBe(false)
        expect(ba.isDisabled).toBe(true)
        expect(bb.isDisabled).toBe(false)
        expect(c.isDisabled).toBe(false)
        expect(ca.isDisabled).toBe(true)
        expect(caa.isDisabled).toBe(true)
      }

      const whenFlatMode = vm => {
        const { a, aa, b, ba, bb, c, ca, caa } = vm.nodeMap

        expect(a.isDisabled).toBe(true)
        expect(aa.isDisabled).toBe(false)
        expect(b.isDisabled).toBe(false)
        expect(ba.isDisabled).toBe(true)
        expect(bb.isDisabled).toBe(false)
        expect(c.isDisabled).toBe(false)
        expect(ca.isDisabled).toBe(true)
        expect(caa.isDisabled).toBe(false)
      }

      it('flat=false', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            flat: false,
            options,
          },
        })
        const { vm } = wrapper

        whenNonFlatMode(vm)
      })

      it('flat=true', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            flat: true,
            options,
          },
        })
        const { vm } = wrapper

        whenFlatMode(vm)
      })

      it('should reinitialize options after value of `flat` prop changes', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            options,
          },
        })
        const { vm } = wrapper

        wrapper.setProps({ flat: false })
        whenNonFlatMode(vm)

        wrapper.setProps({ flat: true })
        whenFlatMode(vm)

        wrapper.setProps({ flat: false })
        whenNonFlatMode(vm)
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
          } ],
          loadOptions() { /* empty */ },
        },
      })
      const { vm } = wrapper
      const { a, b, c } = vm.nodeMap

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

  it('declaring branch nodes by `isBranch: true` should raise a warning', () => {
    spyOn(console, 'error')

    mount(Treeselect, {
      propsData: {
        options: [ {
          id: 'branch',
          label: 'branch',
          isBranch: true,
        } ],
      },
    })

    expect(console.error).toHaveBeenCalledWith(
      '[Vue-Treeselect Warning]',
      'Are you meant to declares an unloaded branch node? ' +
        '`isBranch: true` is no longer supported, please use `children: null` instead.'
    )
  })

  describe('should warn about duplicate node ids', () => {
    it('case #1', () => {
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

    it('case #2', () => {
      spyOn(console, 'error')

      mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'same_id',
            label: 'a',
            children: [ {
              id: 'same_id',
              label: 'b',
            } ],
          } ],
        },
      })

      expect(console.error).toHaveBeenCalledWith(
        '[Vue-Treeselect Warning]',
        'Detected duplicate presence of node id "same_id". ' +
          'Their labels are "a" and "b" respectively.'
      )
    })
  })

  it('fallback nodes should not be considered duplicate', async () => {
    spyOn(console, 'error')

    const DELAY = 10
    const vm = new Vue({
      components: { Treeselect },
      data: {
        value: 'a', // <- this creates a fallback node
        options: null,
        loadOptions({ callback }) {
          setTimeout(() => {
            vm.options = [ {
              id: 'a',
              label: 'a',
            } ]
            callback()
          }, DELAY)
        },
      },
      template: `
        <div>
          <treeselect
            v-model="value"
            :options="options"
            :load-options="loadOptions"
          />
        </div>
      `,
    }).$mount()
    const comp = vm.$children[0]

    expect(comp.nodeMap.a.isFallbackNode).toBe(true)

    await sleep(DELAY + 1)
    expect(console.error).not.toHaveBeenCalled()
    expect(comp.nodeMap.a).not.toHaveMember('isFallbackNode')
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
    const { vm } = wrapper

    expect(vm.nodeCheckedStateMap).toBeEmptyObject()
    wrapper.setProps({ multiple: true })
    expect(vm.nodeCheckedStateMap).toBeNonEmptyObject()
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
    const { vm } = wrapper

    expect(vm.nodeCheckedStateMap).toEqual({
      a: 0,
      aa: 0,
    })
    wrapper.setProps({ value: [ 'a' ] })
    expect(vm.nodeCheckedStateMap).toEqual({
      a: 2,
      aa: 2,
    })
  })

  it('v-model support', async () => {
    // vue-test-utils doesn't support testing v-model
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
  })

  it('an option should be rendered with its id in the markup', () => {
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
        defaultExpandLevel: Infinity,
      },
      data: {
        isOpen: true,
      },
    })
    const optionsWrappers = wrapper.findAll(TreeselectOption).wrappers
    const a = optionsWrappers.find(optionWrapper => optionWrapper.vm.node.id === 'a')
      .find('.vue-treeselect__option')
    const aa = optionsWrappers.find(optionWrapper => optionWrapper.vm.node.id === 'aa')
      .find('.vue-treeselect__option')

    expect(a.attributes()['data-id']).toBe('a')
    expect(aa.attributes()['data-id']).toBe('aa')
  })
})
