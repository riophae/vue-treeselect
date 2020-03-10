import { mount } from '@vue/test-utils'
import sleep from 'yaku/lib/sleep'
import { typeSearchText, findMenu, findVisibleOptions, findOptionByNodeId, findOptionArrowByNodeId } from './shared'
import Treeselect from '@src/components/Treeselect'
import { INPUT_DEBOUNCE_DELAY } from '@src/constants'

describe('Searching', () => {
  describe('local search', () => {
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

  it('flatten search results', async () => {
    async function typeAndAssert(searchText, idListOfNodesThatShouldBeVisible) {
      await typeSearchText(wrapper, searchText)
      const visibleOptionWrappers = findVisibleOptions(wrapper).wrappers
      const visibleOptionIds = visibleOptionWrappers.map(optionWrapper => {
        return optionWrapper.element.dataset.id
      })
      visibleOptionWrappers.forEach(visibleOption => {
        const isLevel0 = visibleOption.element.parentElement.classList.contains('vue-treeselect__indent-level-0')
        expect(isLevel0).toBe(true)
      })
      expect(visibleOptionIds).toEqual(idListOfNodesThatShouldBeVisible)
    }

    const wrapper = mount(Treeselect, {
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
        } ],
        flattenSearchResults: true,
      },
    })

    await wrapper.vm.openMenu()
    await typeAndAssert('a', [ 'a', 'aa', 'ab' ])
    await typeAndAssert('ab', [ 'ab' ])
    await typeAndAssert('b', [ 'ab', 'b' ])
  })

  describe('async search', () => {
    it('basic', async () => {
      let id = 0
      const DELAY = 50
      const wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          async: true,
          loadOptions({ action, searchQuery, callback }) {
            if (action === 'ASYNC_SEARCH') {
              setTimeout(() => {
                callback(null, [ {
                  id: id++,
                  label: searchQuery,
                } ])
              }, DELAY)
            }
          },
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()
      const menu = findMenu(wrapper)

      expect(menu.text().trim()).toBe('Type to search...')

      await typeSearchText(wrapper, 'a')
      expect(menu.text().trim()).toBe('Loading...')
      await sleep(DELAY)

      expect(menu.text().trim()).toBe('a')
      expect(vm.forest.normalizedOptions).toEqual([ jasmine.objectContaining({
        id: 0,
        label: 'a',
      }) ])

      await typeSearchText(wrapper, '')
      expect(menu.text().trim()).toBe('Type to search...')

      await typeSearchText(wrapper, 'b')
      expect(menu.text().trim()).toBe('Loading...')
      await sleep(DELAY)

      expect(menu.text().trim()).toBe('b')
      expect(vm.forest.normalizedOptions).toEqual([ jasmine.objectContaining({
        id: 1,
        label: 'b',
      }) ])
    })

    describe('default options', () => {
      it('when defaultOptions=option[]', async () => {
        const wrapper = mount(Treeselect, {
          sync: false,
          propsData: {
            async: true,
            loadOptions({ action, searchQuery, callback }) {
              if (action === 'ASYNC_SEARCH') {
                callback(null, [ {
                  id: searchQuery,
                  label: searchQuery,
                } ])
              }
            },
            defaultOptions: [ {
              id: 'default',
              label: 'default',
            } ],
          },
        })
        const { vm } = wrapper

        vm.openMenu()
        await vm.$nextTick()
        const menu = findMenu(wrapper)

        expect(menu.text().includes('Type to search...')).toBe(false)
        expect(menu.text().includes('default')).toBe(true)

        await typeSearchText(wrapper, 'test')
        expect(menu.text().includes('test')).toBe(true)

        await typeSearchText(wrapper, '')
        expect(menu.text().includes('default')).toBe(true)
      })

      it('when defaultOptions=true', async () => {
        const DELAY = 20
        const wrapper = mount(Treeselect, {
          sync: false,
          propsData: {
            async: true,
            loadOptions({ action, searchQuery, callback }) {
              if (action === 'ASYNC_SEARCH') {
                setTimeout(() => {
                  const option = searchQuery === ''
                    ? 'default'
                    : searchQuery
                  callback(null, [ {
                    id: option,
                    label: option,
                  } ])
                }, DELAY)
              }
            },
            defaultOptions: true,
          },
        })
        const { vm } = wrapper

        expect(vm.remoteSearch['']).toEqual({
          isLoaded: false,
          isLoading: true,
          loadingError: '',
          options: [],
        })

        vm.openMenu()
        await vm.$nextTick()
        const menu = findMenu(wrapper)

        expect(menu.text().trim()).toBe('Loading...')

        await sleep(DELAY)
        expect(menu.text().trim()).toBe('default')

        await typeSearchText(wrapper, 'test')
        expect(menu.text().trim()).toBe('Loading...')

        await sleep(DELAY)
        expect(menu.text().trim()).toBe('test')

        await typeSearchText(wrapper, '')
        expect(menu.text().trim()).toBe('default')
      })

      it('when defaultOptions=false', async () => {
        const searchPromptText = '$SEARCH_PROMPT_TEXT$'
        const wrapper = mount(Treeselect, {
          sync: false,
          propsData: {
            async: true,
            loadOptions({ action, searchQuery, callback }) {
              if (action === 'ASYNC_SEARCH') {
                callback(null, [ {
                  id: searchQuery,
                  label: searchQuery,
                } ])
              }
            },
            defaultOptions: false,
            searchPromptText,
          },
        })
        const { vm } = wrapper

        vm.openMenu()
        await vm.$nextTick()
        const menu = findMenu(wrapper)

        expect(menu.text().trim()).toBe(searchPromptText)

        await typeSearchText(wrapper, 'keyword')
        expect(menu.text().trim()).toBe('keyword')

        await typeSearchText(wrapper, '')
        expect(menu.text().trim()).toBe(searchPromptText)
      })
    })

    it('handle loading error & recover from it', async () => {
      const called = {}
      const wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          async: true,
          loadOptions({ action, searchQuery, callback }) {
            if (action === 'ASYNC_SEARCH') {
              if (called[searchQuery]) {
                callback(null, [ {
                  id: searchQuery,
                  label: searchQuery,
                } ])
              } else {
                called[searchQuery] = true
                callback(new Error('test error'))
              }
            }
          },
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()
      const menu = findMenu(wrapper)

      await typeSearchText(wrapper, 'keyword')
      expect(menu.text().trim().includes('test error')).toBe(true)

      menu.find('.vue-treeselect__retry').trigger('click')
      await vm.$nextTick()
      expect(menu.text().trim().includes('keyword')).toBe(true)
    })

    it('multiple active requests in parallel', async () => {
      const DELAY = 50
      const wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          async: true,
          loadOptions({ action, searchQuery, callback }) {
            if (action === 'ASYNC_SEARCH') {
              setTimeout(() => {
                callback(null, [ {
                  id: searchQuery,
                  label: searchQuery,
                } ])
              }, DELAY)
            }
          },
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()
      const menu = findMenu(wrapper)

      await typeSearchText(wrapper, 'a')
      await sleep(DELAY / 2)
      expect(vm.remoteSearch.a.isLoading).toBe(true)

      await typeSearchText(wrapper, 'b')
      await sleep(DELAY / 2)

      // now results for keyword `a` should have been loaded
      expect(vm.remoteSearch.a.isLoaded).toBe(true)
      // but results for keyword `b` is still being loaded
      expect(vm.remoteSearch.b.isLoading).toBe(true)
      expect(menu.text().trim()).toBe('Loading...')

      await sleep(DELAY / 2)
      expect(vm.remoteSearch.b.isLoaded).toBe(true)
      expect(menu.text().trim()).toBe('b')
    })

    it('should preserve information of selected options after search query changes (old options will not be in the list)', async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          async: true,
          multiple: true,
          loadOptions({ action, searchQuery, callback }) {
            if (action === 'ASYNC_SEARCH') {
              callback(null, [ {
                id: searchQuery,
                label: searchQuery,
              } ])
            }
          },
        },
      })
      const { vm } = wrapper
      const assertMultiValueItemLabels = labels => {
        const actualLabels = wrapper.findAll('.vue-treeselect__multi-value-label').wrappers
          .map(labelWrapper => labelWrapper.text().trim())
        expect(actualLabels).toEqual(labels)
      }

      await typeSearchText(wrapper, 'a')
      expect(vm.remoteSearch.a.isLoaded).toBe(true)

      vm.select(vm.forest.nodeMap.a)
      expect(vm.forest.selectedNodeIds).toEqual([ 'a' ])

      await typeSearchText(wrapper, 'b')
      expect(vm.remoteSearch.b.isLoaded).toBe(true)

      vm.select(vm.forest.nodeMap.b)
      await vm.$nextTick()
      expect(vm.forest.selectedNodeIds).toEqual([ 'a', 'b' ])
      expect(vm.forest.nodeMap.a).toEqual(jasmine.objectContaining({
        id: 'a',
        label: 'a',
        isFallbackNode: true,
      }))
      assertMultiValueItemLabels([ 'a', 'b' ])

      await typeSearchText(wrapper, 'a')
      expect(vm.forest.nodeMap.b).toEqual(jasmine.objectContaining({
        id: 'b',
        label: 'b',
        isFallbackNode: true,
      }))
      assertMultiValueItemLabels([ 'a', 'b' ])
    })

    describe('cache options', () => {
      let calls, expectedCalls, wrapper
      const typeAndAssert = async (searchText, shouldHit) => {
        await typeSearchText(wrapper, searchText)
        if (!shouldHit) expectedCalls.push(searchText)
        expect(calls).toEqual(expectedCalls)
      }

      beforeEach(() => {
        calls = []
        expectedCalls = []
        wrapper = mount(Treeselect, {
          sync: false,
          propsData: {
            async: true,
            loadOptions({ action, searchQuery, callback }) {
              if (action === 'ASYNC_SEARCH') {
                calls.push(searchQuery)
                callback(null, [ {
                  id: searchQuery,
                  label: searchQuery,
                } ])
              }
            },
          },
        })
        expect(calls).toEqual([])
      })

      it('when cacheOptions=false', async () => {
        wrapper.setProps({ cacheOptions: false })
        await typeAndAssert('a', false)
        await typeAndAssert('b', false)
        await typeAndAssert('a', false)
        await typeAndAssert('b', false)
      })

      it('when cacheOptions=true', async () => {
        wrapper.setProps({ cacheOptions: true })
        await typeAndAssert('a', false)
        await typeAndAssert('b', false)
        await typeAndAssert('a', true)
        await typeAndAssert('b', true)
      })

      it('change value of cacheOptions', async () => {
        wrapper.setProps({ cacheOptions: true })
        await typeAndAssert('a', false)
        await typeAndAssert('b', false)
        await typeAndAssert('a', true)
        await typeAndAssert('b', true)

        wrapper.setProps({ cacheOptions: false })
        await typeAndAssert('a', false)
        await typeAndAssert('b', false)
        await typeAndAssert('a', false)
        await typeAndAssert('b', false)

        wrapper.setProps({ cacheOptions: true })
        await typeAndAssert('a', true)
        await typeAndAssert('b', true)
        await typeAndAssert('a', true)
        await typeAndAssert('b', true)
      })
    })

    it('should not create new one if there is an ongoing request even with cacheOptions=false', async () => {
      const DELAY = INPUT_DEBOUNCE_DELAY * 10
      const run = async schedules => {
        const start = Date.now()
        const d = 4
        schedules.forEach(s => s[0] *= DELAY)

        while (schedules.length) {
          const [ t, fn ] = schedules.shift()
          const [ next ] = schedules[0] || []
          while (Date.now() - start <= t) await sleep(d)
          if (next && Date.now() - start >= next) throw new Error(`time error @ ${t}`)
          await fn()
        }
      }
      const calls = []
      const wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          async: true,
          cacheOptions: false,
          loadOptions({ action, searchQuery, callback }) {
            if (action === 'ASYNC_SEARCH') {
              calls.push(searchQuery)
              setTimeout(() => {
                callback(null, [])
              }, DELAY * 0.9)
            }
          },
        },
      })
      const { vm } = wrapper

      await run([
        [ 0, async () => {
          const p = typeSearchText(wrapper, 'a')
          await vm.$nextTick()
          expect(calls).toEqual([ 'a' ])
          return p
        } ],
        [ 1 / 3, async () => {
          const p = typeSearchText(wrapper, 'b')
          await vm.$nextTick()
          expect(calls).toEqual([ 'a', 'b' ])
          return p
        } ],
        [ 2 / 3, async () => {
          expect(vm.remoteSearch.a.isLoading).toBe(true)
          const p = typeSearchText(wrapper, 'a')
          await vm.$nextTick()
          expect(calls).toEqual([ 'a', 'b' ])
          return p
        } ],
        [ 1, async () => {
          expect(vm.remoteSearch.a.isLoaded).toBe(true)
          expect(vm.remoteSearch.b.isLoading).toBe(true)
          const p = typeSearchText(wrapper, 'b')
          await vm.$nextTick()
          expect(calls).toEqual([ 'a', 'b' ])
          return p
        } ],
        [ 4 / 3, async () => {
          expect(vm.remoteSearch.b.isLoaded).toBe(true)
          const p = typeSearchText(wrapper, 'a')
          await vm.$nextTick()
          expect(calls).toEqual([ 'a', 'b', 'a' ])
          return p
        } ],
        [ 5 / 3, async () => {
          const p = typeSearchText(wrapper, 'b')
          await vm.$nextTick()
          expect(calls).toEqual([ 'a', 'b', 'a', 'b' ])
          return p
        } ],
        [ 2, () => 'done' ],
      ])
    })

    it('should highlight first option after search query changes', async () => {
      const DELAY = 10
      const keywords = [ 'a', 'b', 'c' ]
      const wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          async: true,
          loadOptions({ action, searchQuery, callback }) {
            if (action === 'ASYNC_SEARCH') {
              setTimeout(() => {
                callback(null, [ 1, 2, 3 ].map(i => {
                  const option = searchQuery + '-' + i
                  return { id: option, label: option }
                }))
              }, DELAY)
            }
          },
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()

      for (const keyword of keywords) {
        await typeSearchText(wrapper, keyword)
        await sleep(DELAY)
        expect(vm.menu.current).toBe(keyword + '-1')
      }
    })

    it('combined with delayed children options loading', async () => {
      const DELAY = 10
      const wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          async: true,
          loadOptions({ action, parentNode, /*searchQuery, */callback }) {
            if (action === 'ASYNC_SEARCH') {
              setTimeout(() => {
                callback(null, [ {
                  id: 'a',
                  label: 'a',
                }, {
                  id: 'b',
                  label: 'b',
                  children: null,
                } ])
              }, DELAY)
            } else if (action === 'LOAD_CHILDREN_OPTIONS') {
              setTimeout(() => {
                parentNode.children = [ {
                  id: 'ba',
                  label: 'ba',
                } ]
                callback()
              }, DELAY)
            }
          },
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()

      await typeSearchText(wrapper, 'random search query')
      await sleep(DELAY)

      expect(vm.menu.current).toBe('a')

      vm.highlightNextOption()
      expect(vm.menu.current).toBe('b')

      vm.toggleExpanded(vm.forest.nodeMap.b)
      await sleep(DELAY)

      // should not reset highlighted item
      expect(vm.menu.current).toBe('b')
      expect(findOptionByNodeId(wrapper, 'ba')).toBeTruthy()
    })
  })
})
