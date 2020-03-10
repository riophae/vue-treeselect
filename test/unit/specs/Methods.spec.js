import { mount } from '@vue/test-utils'
import { typeSearchText } from './shared'
import Treeselect from '@src/components/Treeselect'

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
      const { a } = vm.forest.nodeMap

      expect(a.isExpanded).toBe(false)
      wrapper.vm.toggleExpanded(a)
      expect(a.isExpanded).toBe(true)
    })
  })

  describe('clear()', () => {
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
          }, {
            id: 'c',
            label: 'c',
            isDisabled: true,
          } ],
        },
      })
      vm = wrapper.vm
    })

    it('when multiple=false', () => {
      wrapper.setProps({ multiple: false })

      wrapper.setProps({ value: 'a' })
      vm.clear()
      expect(vm.internalValue).toEqual([])

      // Should clear disabled value.
      wrapper.setProps({ value: 'c' })
      vm.clear()
      expect(vm.internalValue).toEqual([])
    })

    it('when multiple=true', () => {
      wrapper.setProps({ multiple: true })

      wrapper.setProps({ value: [ 'a', 'b' ] })
      vm.clear()
      expect(vm.internalValue).toEqual([])

      // Should not clear disabled value.
      wrapper.setProps({ value: [ 'a', 'b', 'c' ] })
      vm.clear()
      expect(vm.internalValue).toEqual([ 'c' ])
    })
  })

  it('focusInput() & blurInput()', () => {
    const wrapper = mount(Treeselect, {
      attachToDocument: true,
      propsData: {
        options: [],
        disabled: false,
        searchable: true,
        autoFocus: false,
      },
    })
    const { vm } = wrapper

    expect(vm.trigger.isFocused).toBe(false)
    wrapper.vm.focusInput()
    expect(vm.trigger.isFocused).toBe(true)
    wrapper.vm.blurInput()
    expect(vm.trigger.isFocused).toBe(false)
  })

  describe('getMenu()', () => {
    let wrapper, vm

    const createInstance = appendToBody => {
      wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          appendToBody,
          options: [],
        },
        attachToDocument: true,
      })
      vm = wrapper.vm
    }

    afterEach(() => {
      wrapper.destroy()
    })

    it('when appendToBody=false', async () => {
      createInstance(false)

      vm.openMenu()
      await vm.$nextTick()

      expect(vm.getMenu().classList).toContain('vue-treeselect__menu')
    })

    it('when appendToBody=true', async () => {
      createInstance(true)

      vm.openMenu()
      await vm.$nextTick()

      expect(vm.getMenu().classList).toContain('vue-treeselect__menu')
    })

    it('when menu is closed', async () => {
      createInstance(false)
      expect(vm.getMenu()).toBe(null)

      vm.openMenu()
      await vm.$nextTick()
      expect(vm.getMenu().classList).toContain('vue-treeselect__menu')

      vm.closeMenu()
      await vm.$nextTick()
      expect(vm.getMenu()).toBe(null)
    })
  })

  describe('openMenu()', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          options: [],
        },
      })
      expect(wrapper.vm.menu.isOpen).toBe(false)
    })

    it('should activate the menu', () => {
      wrapper.vm.openMenu()
      expect(wrapper.vm.menu.isOpen).toBe(true)
    })

    it('should ignore when disabled=true', () => {
      wrapper.setProps({ disabled: true })
      wrapper.vm.openMenu()
      expect(wrapper.vm.menu.isOpen).toBe(false)
    })
  })

  describe('closeMenu()', () => {
    it('should close the menu', () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          options: [],
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      expect(wrapper.vm.menu.isOpen).toBe(true)

      vm.closeMenu()
      expect(wrapper.vm.menu.isOpen).toBe(false)
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
        'Invalid node id: null',
      )
    })
  })

  describe('removeLastValue()', () => {
    it('single-select', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          value: 'a',
          multiple: false,
          options: [ {
            id: 'a',
            label: 'a',
          } ],
        },
      })
      const { vm } = wrapper

      vm.removeLastValue()
      expect(vm.internalValue).toEqual([])
      vm.removeLastValue()
      expect(vm.internalValue).toEqual([])
    })

    describe('multi-select', () => {
      describe('flat mode', () => {
        let wrapper, vm

        beforeEach(() => {
          wrapper = mount(Treeselect, {
            propsData: {
              flat: true,
              multiple: true,
              value: [ 'c', 'aaa', 'bb' ],
              options: [ 'a', 'b', 'c' ].map(letter => ({
                id: letter,
                label: letter,
                children: [ {
                  id: letter.repeat(2),
                  label: letter.repeat(2),
                  children: [ {
                    id: letter.repeat(3),
                    label: letter.repeat(3),
                  } ],
                } ],
              })),
            },
          })
          vm = wrapper.vm
        })

        it('when sortValueBy=ORDER_SELECTED', () => {
          wrapper.setProps({ sortValueBy: 'ORDER_SELECTED' })
          expect(vm.internalValue).toEqual([ 'c', 'aaa', 'bb' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([ 'c', 'aaa' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([ 'c' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([])
        })

        it('when sortValueBy=LEVEL', () => {
          wrapper.setProps({ sortValueBy: 'LEVEL' })
          expect(vm.internalValue).toEqual([ 'c', 'bb', 'aaa' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([ 'c', 'bb' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([ 'c' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([])
        })

        it('when sortValueBy=INDEX', () => {
          wrapper.setProps({ sortValueBy: 'INDEX' })
          expect(vm.internalValue).toEqual([ 'aaa', 'bb', 'c' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([ 'aaa', 'bb' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([ 'aaa' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([])
        })
      })

      describe('with `valueConsistsOf` prop', () => {
        let wrapper, vm

        beforeEach(() => {
          wrapper = mount(Treeselect, {
            propsData: {
              multiple: true,
              value: [ 'a' ],
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
              } ],
            },
          })
          vm = wrapper.vm
        })

        it('when valueConsistsOf=ALL', () => {
          wrapper.setProps({ valueConsistsOf: 'ALL' })
          expect(vm.internalValue).toEqual([ 'a', 'aa', 'ab', 'aaa', 'aab' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([ 'ab', 'aaa' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([ 'ab' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([])
        })

        it('when valueConsistsOf=BRANCH_PRIORITY', () => {
          wrapper.setProps({ valueConsistsOf: 'BRANCH_PRIORITY' })
          expect(vm.internalValue).toEqual([ 'a' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([])
        })

        it('when valueConsistsOf=LEAF_PRIORITY', () => {
          wrapper.setProps({ valueConsistsOf: 'LEAF_PRIORITY' })
          expect(vm.internalValue).toEqual([ 'ab', 'aaa', 'aab' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([ 'ab', 'aaa' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([ 'ab' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([])
        })

        it('when valueConsistsOf=ALL_WITH_INDETERMINATE', () => {
          // TODO: the order is still strange
          wrapper.setProps({ valueConsistsOf: 'ALL_WITH_INDETERMINATE' })
          expect(vm.internalValue).toEqual([ 'a', 'aa', 'ab', 'aaa', 'aab' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([ 'ab', 'aaa', 'a', 'aa' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([ 'ab', 'a' ])
          vm.removeLastValue()
          expect(vm.internalValue).toEqual([])
        })
      })
    })
  })

  it('setCurrentHighlightedOption()', () => {
    // TODO
  })

  describe('resetCurrentHighlightedOption()', () => {
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
      vm = wrapper.vm
    })

    it('when current=null', () => {
      expect(vm.menu.current).toBe(null)
      vm.resetHighlightedOptionWhenNecessary()
      expect(vm.menu.current).toBe('a')
    })

    it('when forceReset=true', () => {
      vm.setCurrentHighlightedOption(vm.forest.nodeMap.b)
      expect(vm.menu.current).toBe('b')
      vm.resetHighlightedOptionWhenNecessary()
      expect(vm.menu.current).toBe('b')
      vm.resetHighlightedOptionWhenNecessary(true)
      expect(vm.menu.current).toBe('a')
    })

    it('when current highlighted option not present in the list', async () => {
      vm.openMenu()
      await vm.$nextTick()

      expect(vm.menu.current).toBe('a')

      await typeSearchText(wrapper, 'bb')
      expect(vm.visibleOptionIds).toEqual([ 'b', 'bb' ])
      expect(vm.menu.current).toBe('b')

      vm.setCurrentHighlightedOption(vm.forest.nodeMap.bb)
      expect(vm.menu.current).toBe('bb')

      await typeSearchText(wrapper, 'a')
      // the previous highlighted option `bb` is not present in the list now
      expect(vm.visibleOptionIds).toEqual([ 'a', 'b', 'ba' ])
      expect(vm.menu.current).toBe('a')
    })
  })
})
