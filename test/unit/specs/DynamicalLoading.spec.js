import Vue from 'vue'
import { mount } from '@vue/test-utils'
import sleep from 'yaku/lib/sleep'
import {
  leftClick,
  typeSearchText,
  findMenu,
  findOptionByNodeId,
  findOptionArrowContainerByNodeId,
  findChildrenOptionListByNodeId,
} from './shared'
import Treeselect from '@src/components/Treeselect'
import { CHECKED } from '@src/constants'

describe('Dynamical Loading', () => {
  describe('Verify props', () => {
    it('should warn about absense of `loadOptions` prop when options=null', () => {
      spyOn(console, 'error')

      mount(Treeselect, {
        propsData: {
          options: null,
        },
      })

      expect(console.error).toHaveBeenCalledWith(
        '[Vue-Treeselect Warning]',
        'Are you meant to dynamically load options? You need to use "loadOptions" prop.',
      )
    })

    it('should warn about absense of `loadOptions` prop when unloaded branch nodes detected', () => {
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
        'Unloaded branch node detected. "loadOptions" prop is required to load its children.',
      )
    })
  })

  describe('Loading children options', () => {
    it('expanding an unloaded branch node should trigger loading its children options', () => {
      const loadOptions = jasmine.createSpy()
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          loadOptions,
        },
      })
      const { vm } = wrapper

      expect(vm.forest.nodeMap.a.isExpanded).toBe(false) // collapsed by default
      vm.toggleExpanded(vm.forest.nodeMap.a) // expand it
      expect(loadOptions).toHaveBeenCalled()
    })

    it('load children options using `loadOptions` prop', async () => {
      const DELAY = 10
      const loadOptions = ({ action, parentNode, callback }) => {
        expect(action).toBe('LOAD_CHILDREN_OPTIONS')

        setTimeout(() => {
          parentNode.children = [ {
            id: 'aa',
            label: 'aa',
          } ]
          callback()
        }, DELAY)
      }
      const spyForLoadOptions = jasmine.createSpy('loadOptions', loadOptions).and.callThrough()
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          loadOptions: spyForLoadOptions,
        },
      })
      const { vm } = wrapper
      let childrenOptionList

      vm.openMenu()

      // children awaits to be loaded
      expect(vm.forest.nodeMap.a.children).toBeEmptyArray()
      // collapsed by default
      expect(vm.forest.nodeMap.a.isExpanded).toBe(false)
      // other things...
      expect(vm.forest.nodeMap.a.childrenStates.isLoading).toBe(false)
      expect(vm.forest.nodeMap.a.childrenStates.isLoaded).toBe(false)
      // expand it
      vm.toggleExpanded(vm.forest.nodeMap.a)
      expect(spyForLoadOptions).toHaveBeenCalled()
      expect(vm.forest.nodeMap.a.childrenStates.isLoading).toBe(true)
      await vm.$nextTick()
      childrenOptionList = findChildrenOptionListByNodeId(wrapper, 'a')
      // show loading spinner
      expect(childrenOptionList.contains('.vue-treeselect__loading-tip')).toBe(true)

      // wait for `callback()` to be called
      await sleep(DELAY)
      // options should has been reinitilaized
      expect(vm.forest.nodeMap.a.children).toBeNonEmptyArray()
      expect(vm.forest.nodeMap.a.childrenStates.isLoaded).toBe(true)
      expect(vm.forest.nodeMap.a.childrenStates.isLoading).toBe(false)
      childrenOptionList = findChildrenOptionListByNodeId(wrapper, 'a')
      // loading spinner should be hidden
      expect(childrenOptionList.contains('.vue-treeselect__loading-tip')).toBe(false)
      // children options just loaded should be rendered
      expect(childrenOptionList.element.contains(findOptionByNodeId(wrapper, 'aa').element)).toBe(true)
    })

    it('handle error of loading children options & recover from it', async () => {
      const DELAY = 10
      const ERROR_MESSAGE = '$ERROR_MESSAGE$'
      let called = 0
      const loadOptions = ({ parentNode, callback }) => {
        setTimeout(() => {
          if (++called > 2) {
            parentNode.children = [ {
              id: 'aa',
              label: 'aa',
            } ]
            callback()
          } else {
            callback(new Error(ERROR_MESSAGE))
          }
        }, DELAY)
      }
      const spyForLoadOptions = jasmine.createSpy('loadOptions', loadOptions).and.callThrough()
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null, // declares an unloaded branch node
          } ],
          loadOptions: spyForLoadOptions,
        },
      })
      const { vm } = wrapper
      let optionArrowContainer
      let childrenOptionList

      vm.openMenu()

      // 1st try
      optionArrowContainer = findOptionArrowContainerByNodeId(wrapper, 'a')
      leftClick(optionArrowContainer) // expand
      expect(spyForLoadOptions.calls.count()).toBe(1)
      await sleep(DELAY)
      childrenOptionList = findChildrenOptionListByNodeId(wrapper, 'a')
      // should show error tip
      expect(childrenOptionList.contains('.vue-treeselect__error-tip')).toBe(true)
      const errorText = childrenOptionList.find('.vue-treeselect__error-tip-text').text()
      expect(errorText.includes(ERROR_MESSAGE)).toBe(true)
      expect(vm.forest.nodeMap.a.childrenStates.loadingError).toBe(ERROR_MESSAGE)

      // 2nd try - click on retry
      const retry = wrapper.find('.vue-treeselect__retry')
      leftClick(retry)
      expect(spyForLoadOptions.calls.count()).toBe(2)
      // should reset state
      expect(vm.forest.nodeMap.a.childrenStates.isLoading).toBe(true)
      expect(vm.forest.nodeMap.a.childrenStates.loadingError).toBe('')
      await sleep(DELAY)
      childrenOptionList = findChildrenOptionListByNodeId(wrapper, 'a')
      // still shows the error tip
      expect(childrenOptionList.contains('.vue-treeselect__error-tip')).toBe(true)

      // 3nd try - collapse & re-expand
      optionArrowContainer = findOptionArrowContainerByNodeId(wrapper, 'a')
      leftClick(optionArrowContainer) // collapse
      leftClick(optionArrowContainer) // re-expand
      expect(spyForLoadOptions.calls.count()).toBe(3)
      await sleep(DELAY)
      childrenOptionList = findChildrenOptionListByNodeId(wrapper, 'a')
      // the error tip should be hidden
      expect(childrenOptionList.contains('.vue-treeselect__error-tip')).toBe(false)
      // the children options just loaded should be shown
      expect(childrenOptionList.element.contains(findOptionByNodeId(wrapper, 'aa').element)).toBe(true)
    })

    it('should avoid duplicate calling of `loadOptions` when there is already an in-flight request', async () => {
      const DELAY = 60
      const loadOptions = ({ parentNode, callback }) => {
        setTimeout(() => {
          parentNode.children = [ {
            id: 'aa',
            label: 'aa',
          } ]
          callback()
        }, DELAY)
      }
      const spyForLoadOptions = jasmine.createSpy('loadOptions', loadOptions).and.callThrough()
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          loadOptions: spyForLoadOptions,
        },
      })
      const { vm } = wrapper

      vm.toggleExpanded(vm.forest.nodeMap.a)
      expect(spyForLoadOptions.calls.count()).toBe(1)

      await sleep(DELAY / 2)
      expect(vm.forest.nodeMap.a.childrenStates.isLoading).toBe(true)
      vm.toggleExpanded(vm.forest.nodeMap.a) // collapse
      vm.toggleExpanded(vm.forest.nodeMap.a) // re-expand
      expect(spyForLoadOptions.calls.count()).toBe(1) // but not triggers another loading

      await sleep(DELAY / 2)
      expect(vm.forest.nodeMap.a.children).toBeNonEmptyArray()
    })

    it('after loading children options of a checked node, should also check these children options', async () => {
      let called = 0
      const wrapper = mount(Treeselect, {
        sync: false,
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          multiple: true,
          flat: false,
          valueFormat: 'id',
          valueConsistsOf: 'BRANCH_PRIORITY',
          loadOptions({ action, parentNode, callback }) {
            expect(action).toBe('LOAD_CHILDREN_OPTIONS')

            called++

            if (parentNode.id === 'a') {
              expect(called).toBe(1)
              parentNode.children = [ {
                id: 'aa',
                label: 'aa',
                children: null,
              }, {
                id: 'ab',
                label: 'ab',
              } ]
              callback()
            }

            if (parentNode.id === 'aa') {
              expect(called).toBe(2)
              parentNode.children = [ {
                id: 'aaa',
                label: 'aaa',
              }, {
                id: 'aab',
                label: 'aab',
              } ]
              callback()
            }
          },
        },
      })
      const { vm } = wrapper

      vm.select(vm.forest.nodeMap.a)
      expect(vm.internalValue).toEqual([ 'a' ])
      expect(vm.forest.selectedNodeIds).toEqual([ 'a' ])
      expect(vm.forest.checkedStateMap).toEqual({
        a: CHECKED,
      })

      vm.toggleExpanded(vm.forest.nodeMap.a)
      expect(called).toBe(1)
      await vm.$nextTick()
      expect(vm.internalValue).toEqual([ 'a' ])
      expect(vm.forest.selectedNodeIds).toEqual([ 'a', 'aa', 'ab' ])
      expect(vm.forest.checkedStateMap).toEqual({
        a: CHECKED,
        aa: CHECKED,
        ab: CHECKED,
      })

      vm.toggleExpanded(vm.forest.nodeMap.aa)
      expect(called).toBe(2)
      expect(vm.internalValue).toEqual([ 'a' ])
      await vm.$nextTick()
      expect(vm.forest.selectedNodeIds).toEqual([ 'a', 'aa', 'ab', 'aaa', 'aab' ])
      expect(vm.forest.checkedStateMap).toEqual({
        a: CHECKED,
        aa: CHECKED,
        ab: CHECKED,
        aaa: CHECKED,
        aab: CHECKED,
      })
    })

    it('should override fallback nodes', async () => {
      const DELAY = 10
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          value: 'aa', // <- this creates a fallback node
          loadOptions({ parentNode, callback }) {
            setTimeout(() => {
              parentNode.children = [ {
                id: 'aa',
                label: 'aa',
              }, {
                id: 'ab',
                label: 'ab',
              } ]
              callback()
            }, DELAY)
          },
        },
      })
      const { vm } = wrapper
      const getValueText = () => wrapper.find('.vue-treeselect__single-value').text().trim()

      expect(vm.forest.nodeMap.aa).toEqual(jasmine.objectContaining({
        id: 'aa',
        label: 'aa (unknown)',
        isFallbackNode: true,
      }))
      expect(getValueText()).toBe('aa (unknown)')

      vm.toggleExpanded(vm.forest.nodeMap.a)
      await sleep(DELAY)
      expect(vm.forest.nodeMap.aa).toEqual(jasmine.objectContaining({
        id: 'aa',
        label: 'aa',
      }))
      expect(getValueText()).toBe('aa')
    })

    it('multiple instances share the same `loadOptions` function', () => {
      const loadOptions = jasmine.createSpy('loadOptions')
      const { vm: vm1 } = mount(Treeselect, {
        propsData: {
          instanceId: 1,
          loadOptions,
          options: [ {
            id: 'branch',
            label: 'branch',
            children: null,
          } ],
        },
      })
      const { vm: vm2 } = mount(Treeselect, {
        propsData: {
          instanceId: 2,
          loadOptions,
          options: [ {
            id: 'branch',
            label: 'branch',
            children: null,
          } ],
        },
      })

      vm1.toggleExpanded(vm1.forest.nodeMap.branch)
      expect(loadOptions.calls.argsFor(0)).toEqual([ {
        id: 1,
        instanceId: 1,
        action: 'LOAD_CHILDREN_OPTIONS',
        parentNode: jasmine.any(Object),
        callback: jasmine.any(Function),
      } ])

      vm2.toggleExpanded(vm2.forest.nodeMap.branch)
      expect(loadOptions.calls.argsFor(1)).toEqual([ {
        id: 2,
        instanceId: 2,
        action: 'LOAD_CHILDREN_OPTIONS',
        parentNode: jasmine.any(Object),
        callback: jasmine.any(Function),
      } ])
    })

    it('callback can be executed only once', () => {
      const loadOptions = jasmine.createSpy('loadOptions', ({ parentNode, callback }) => {
        parentNode.children = []
        callback()
        callback(new Error('test')) // this will be ignored
      }).and.callThrough()
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          loadOptions,
        },
      })
      const { vm } = wrapper

      vm.toggleExpanded(vm.forest.nodeMap.a)
      expect(loadOptions).toHaveBeenCalled()
      expect(vm.forest.nodeMap.a.childrenStates.loadingError).toBe('')
    })

    it('should accept promises', async () => {
      let called = false
      const DELAY = 10
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          async loadOptions({ parentNode }) {
            await sleep(DELAY)
            if (called) {
              parentNode.children = []
            } else {
              called = true
              throw new Error('test')
            }
          },
        },
      })
      const { vm } = wrapper

      vm.toggleExpanded(vm.forest.nodeMap.a) // expand
      await sleep(DELAY)
      expect(vm.forest.nodeMap.a.childrenStates.loadingError).toBe('test')

      vm.toggleExpanded(vm.forest.nodeMap.a) // collapse
      vm.toggleExpanded(vm.forest.nodeMap.a) // re-expand
      await sleep(DELAY)
      expect(vm.forest.nodeMap.a.childrenStates.isLoaded).toBe(true)
    })

    // #97
    it('allows resetting a branch node to unloaded state by setting back `children: null`', async () => {
      const options = [ {
        id: 'a',
        label: 'a',
        children: null,
      } ]
      let spy
      const expand = fn => {
        spy = fn
        // expand the branch node and vue-treeselect will call `loadOptions` prop
        vm.toggleExpanded(vm.forest.nodeMap.a)
      }
      const wrapper = mount(Treeselect, {
        propsData: {
          options,
          loadOptions({ action, parentNode, callback }) {
            if (action === 'LOAD_CHILDREN_OPTIONS') {
              spy(parentNode, callback)
            }
          },
        },
      })
      const { vm } = wrapper

      // the branch node `a` is initially unloaded
      expect(vm.forest.nodeMap.a.childrenStates).toEqual({
        isLoaded: false,
        isLoading: false,
        loadingError: '',
      })

      // expand the branch node `a` and load its children
      expand((parentNode, callback) => {
        parentNode.children = [ {
          id: 'aa',
          label: 'aa',
        } ]
        callback()
      })
      expect(vm.forest.nodeMap.a.childrenStates).toEqual({
        isLoaded: true,
        isLoading: false,
        loadingError: '',
      })

      // reset branch node `a` to unloaded state by setting `children: null`
      options[0].children = null
      await vm.$nextTick()
      // the branch node `a` will be automatically collapsed by vue-treeselect
      expect(vm.forest.nodeMap.a.isExpanded).toBe(false)
      expect(vm.forest.nodeMap.a.childrenStates).toEqual({
        isLoaded: false,
        isLoading: false,
        loadingError: '',
      })

      // re-expand the branch node `a` and this time we simulate a loading error
      expand((parentNode, callback) => {
        callback(new Error('test'))
      })
      expect(vm.forest.nodeMap.a.childrenStates).toEqual({
        isLoaded: false,
        isLoading: false,
        loadingError: 'test',
      })

      // reset the branch node `a` again, but this time it's no-op since the
      // branch node `a` is already at unloaded state
      options[0].children = null
      await vm.$nextTick()
      expect(vm.forest.nodeMap.a.isExpanded).toBe(true)
      expect(vm.forest.nodeMap.a.childrenStates).toEqual({
        isLoaded: false,
        isLoading: false,
        loadingError: 'test',
      })
    })

    it('should keep the highlighted state after loading children options', async () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
          }, {
            id: 'b',
            label: 'b',
            children: null,
          } ],
          loadOptions({ parentNode, callback }) {
            parentNode.children = [ {
              id: 'ba',
              label: 'ba',
            } ]
            callback()
          },
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()

      vm.setCurrentHighlightedOption(vm.forest.nodeMap.b)
      expect(vm.menu.current).toBe('b')
      expect(vm.forest.nodeMap.b.isHighlighted).toBe(true)

      vm.toggleExpanded(vm.forest.nodeMap.b)
      expect(vm.forest.nodeMap.b.childrenStates.isLoaded).toBe(true)
      expect(vm.forest.nodeMap.b.isHighlighted).toBe(true)
    })

    it('load children options when doing local search', async () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'branch',
            label: 'branch',
            children: null,
          }, {
            id: 'other',
            label: 'other',
          } ],
          loadOptions({ parentNode, callback }) {
            parentNode.children = [ {
              id: 'leaf',
              label: 'leaf',
            } ]
            callback()
          },
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()
      const menu = findMenu(wrapper)

      await typeSearchText(wrapper, 'branch')
      expect(vm.visibleOptionIds).toEqual([ 'branch' ])

      vm.toggleExpanded(vm.forest.nodeMap.branch)
      await vm.$nextTick()

      expect(vm.forest.nodeMap.branch.childrenStates.isLoaded).toBe(true)
      expect(vm.visibleOptionIds).toEqual([ 'branch', 'leaf' ])

      const labels = menu.findAll('.vue-treeselect__option:not(.vue-treeselect__option--hide) .vue-treeselect__label')
        .wrappers.map(label => label.text().trim())
      expect(labels).toEqual([ 'branch', 'leaf' ])
    })
  })

  describe('Loading root options', () => {
    it('mounting the component should trigger loading root options', () => {
      const loadOptions = jasmine.createSpy()
      mount(Treeselect, {
        propsData: {
          options: null,
          loadOptions,
        },
      })

      expect(loadOptions).toHaveBeenCalled()
    })

    it('with autoLoadRootOptions=false, opening the menu should trigger loading root options', () => {
      const loadOptions = jasmine.createSpy()
      const wrapper = mount(Treeselect, {
        propsData: {
          options: null,
          loadOptions,
          autoLoadRootOptions: false,
        },
      })
      const { vm } = wrapper

      expect(loadOptions).not.toHaveBeenCalled()
      vm.openMenu()
      expect(loadOptions).toHaveBeenCalled()
    })

    it('load root options using `loadOptions` prop', async () => {
      const DELAY = 10
      const loadOptions = ({ action, callback }) => {
        expect(action).toBe('LOAD_ROOT_OPTIONS')

        setTimeout(() => {
          app.options = [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
            } ],
          }, {
            id: 'b',
            label: 'b',
          } ]
          callback()
        }, DELAY)
      }
      const spyForLoadOptions = jasmine.createSpy('loadOptions', loadOptions).and.callThrough()
      const app = new Vue({
        components: { Treeselect },
        data: {
          options: null,
          loadOptions: spyForLoadOptions,
        },
        template: `
          <div>
            <treeselect
              :options="options"
              :load-options="loadOptions"
              :auto-load-root-options= "false"
              />
          </div>
        `,
      }).$mount()
      const vm = app.$children[0]

      expect(vm.rootOptionsStates.isLoading).toBe(false)

      vm.openMenu()
      await vm.$nextTick()

      const menu = vm.getMenu()
      expect(vm.rootOptionsStates.isLoading).toBe(true)
      // should show a loading tip
      expect(menu.firstElementChild.className).toEqual(jasmine.stringMatching('vue-treeselect__loading-tip'))
      expect(menu.firstElementChild.textContent.trim()).toBe('Loading...')

      await sleep(DELAY)
      expect(vm.rootOptionsStates.isLoading).toBe(false)
      expect(vm.rootOptionsStates.isLoaded).toBe(true)
      // should hide the loading tip
      expect(menu.querySelector('.vue-treeselect__loading-tip')).toBe(null)
      // options should be registered
      expect(Object.keys(vm.forest.nodeMap)).toEqual([ 'a', 'aa', 'b' ])
      // root options should be rendered
      const labels = [].slice.call(menu.querySelectorAll('.vue-treeselect__label'))
        .map($label => $label.textContent.trim())
      expect(labels).toEqual([ 'a', 'b' ])
    })

    it('handle error of loading root options & recover from it', async () => {
      const DELAY = 10
      const ERROR_MESSAGE = '$ERROR_MESSAGE$'
      let called = false
      const loadOptions = ({ callback }) => {
        setTimeout(() => {
          if (called) {
            app.options = [ {
              id: 'a',
              label: 'a',
              children: [ {
                id: 'aa',
                label: 'aa',
              } ],
            }, {
              id: 'b',
              label: 'b',
            } ]
            callback()
          } else {
            called = true
            callback(new Error(ERROR_MESSAGE))
          }
        }, DELAY)
      }
      const spyForLoadOptions = jasmine.createSpy('loadOptions', loadOptions).and.callThrough()
      const app = new Vue({
        components: { Treeselect },
        data: {
          options: null,
          loadOptions: spyForLoadOptions,
        },
        template: `
          <div>
            <treeselect
              :options="options"
              :load-options="loadOptions"
              :auto-load-root-options= "false"
              />
          </div>
        `,
      }).$mount()
      const vm = app.$children[0]
      let menu

      // 1st try
      vm.openMenu()
      expect(spyForLoadOptions.calls.count()).toBe(1)
      await sleep(DELAY)
      expect(vm.rootOptionsStates.isLoading).toBe(false)
      expect(vm.rootOptionsStates.loadingError).toBe(ERROR_MESSAGE)
      expect(vm.rootOptionsStates.isLoaded).toBe(false)
      menu = vm.getMenu()
      expect(menu.firstElementChild.className).toEqual(jasmine.stringMatching('vue-treeselect__error-tip'))
      expect(menu.querySelector('.vue-treeselect__error-tip-text').textContent.includes(ERROR_MESSAGE)).toBe(true)

      // 2nd try
      vm.closeMenu()
      vm.openMenu()
      // reset state
      expect(vm.rootOptionsStates.loadingError).toBe('')
      await sleep(DELAY)
      expect(vm.rootOptionsStates.isLoading).toBe(false)
      expect(vm.rootOptionsStates.isLoaded).toBe(true)
      menu = vm.getMenu()
      expect(menu.querySelector('.vue-treeselect__error-tip')).toBe(null)
      // options should be registered
      expect(Object.keys(vm.forest.nodeMap)).toEqual([ 'a', 'aa', 'b' ])
      // root options should be rendered
      const labels = [].slice.call(menu.querySelectorAll('.vue-treeselect__label'))
        .map($label => $label.textContent.trim())
      expect(labels).toEqual([ 'a', 'b' ])
    })

    it('should avoid duplicate calling of `loadOptions` when there is already an in-flight request', async () => {
      const DELAY = 60
      const loadOptions = ({ callback }) => {
        setTimeout(() => {
          app.options = []
          callback()
        }, DELAY)
      }
      const spyForLoadOptions = jasmine.createSpy('loadOptions', loadOptions).and.callThrough()
      const app = new Vue({
        components: { Treeselect },
        data: {
          options: null,
          loadOptions: spyForLoadOptions,
        },
        template: `
          <div>
            <treeselect
              :options="options"
              :load-options="loadOptions"
              :auto-load-root-options= "false"
              />
          </div>
        `,
      }).$mount()
      const vm = app.$children[0]

      vm.openMenu()
      expect(spyForLoadOptions.calls.count()).toBe(1)

      await sleep(DELAY / 2)
      expect(vm.rootOptionsStates.isLoading).toBe(true)
      vm.closeMenu()
      await vm.$nextTick()
      vm.openMenu()
      await vm.$nextTick()
      expect(spyForLoadOptions.calls.count()).toBe(1)
    })

    it('should override fallback nodes', async () => {
      const DELAY = 10
      const app = new Vue({
        components: { Treeselect },
        data: {
          options: null,
          value: 'a', // <- this creates a fallback node
          loadOptions({ callback }) {
            setTimeout(() => {
              app.options = [ {
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
              :auto-load-root-options= "true"
              />
          </div>
        `,
      }).$mount()
      const vm = app.$children[0]

      expect(vm.rootOptionsStates.isLoading).toBe(true)
      expect(vm.forest.nodeMap.a).toEqual(jasmine.objectContaining({
        id: 'a',
        label: 'a (unknown)',
        isFallbackNode: true,
      }))

      await sleep(DELAY)
      expect(vm.rootOptionsStates.isLoading).toBe(false)
      expect(vm.forest.nodeMap.a).toEqual(jasmine.objectContaining({
        id: 'a',
        label: 'a',
      }))
    })

    it('multiple instances share the same `loadOptions` function', () => {
      const loadOptions = jasmine.createSpy('loadOptions')
      const { vm: vm1 } = mount(Treeselect, {
        propsData: {
          instanceId: 1,
          loadOptions,
          options: null,
          autoLoadRootOptions: false,
        },
      })
      const { vm: vm2 } = mount(Treeselect, {
        propsData: {
          instanceId: 2,
          loadOptions,
          options: null,
          autoLoadRootOptions: false,
        },
      })

      vm1.openMenu()
      expect(loadOptions.calls.argsFor(0)).toEqual([ {
        id: 1,
        instanceId: 1,
        action: 'LOAD_ROOT_OPTIONS',
        callback: jasmine.any(Function),
      } ])

      vm2.openMenu()
      expect(loadOptions.calls.argsFor(1)).toEqual([ {
        id: 2,
        instanceId: 2,
        action: 'LOAD_ROOT_OPTIONS',
        callback: jasmine.any(Function),
      } ])
    })

    it('callback can be executed only once', () => {
      const { vm } = mount(Treeselect, {
        propsData: {
          loadOptions({ callback }) {
            callback(new Error('test'))
            callback() // this will be ignored
          },
          options: null,
          autoLoadRootOptions: false,
        },
      })

      vm.openMenu()
      expect(vm.rootOptionsStates.loadingError).toBe('test')
    })

    it('should accept promises', async () => {
      let called = false
      const DELAY = 10
      const app = new Vue({
        components: { Treeselect },
        data: {
          options: null,
          async loadOptions() {
            await sleep(DELAY)
            if (called) {
              app.options = [ {
                id: 'a',
                label: 'a',
              } ]
            } else {
              called = true
              throw new Error('test')
            }
          },
        },
        template: `
          <div>
            <treeselect
              :options="options"
              :load-options="loadOptions"
              :auto-load-root-options= "false"
              />
          </div>
        `,
      }).$mount()
      const vm = app.$children[0]

      vm.openMenu()
      await sleep(DELAY)
      expect(vm.rootOptionsStates.loadingError).toBe('test')

      vm.closeMenu()
      vm.openMenu()
      await sleep(DELAY)
      expect(vm.rootOptionsStates.isLoaded).toBe(true)
    })

    it('should highlight first option after loading root options', async () => {
      const DELAY = 10
      const app = new Vue({
        components: { Treeselect },
        data: {
          options: null,
          loadOptions({ action, callback }) {
            if (action === 'LOAD_ROOT_OPTIONS') {
              setTimeout(() => {
                app.options = [ 'a', 'b', 'c' ].map(option => ({
                  id: option,
                  label: option,
                }))
                callback()
              }, DELAY)
            }
          },
        },
        template: `
          <div>
            <treeselect
              :options="options"
              :load-options="loadOptions"
              :auto-load-root-options= "false"
              />
          </div>
        `,
      }).$mount()
      const vm = app.$children[0]

      vm.openMenu()
      await vm.$nextTick()

      expect(vm.rootOptionsStates.isLoading).toBe(true)

      await sleep(DELAY)
      expect(vm.forest.normalizedOptions).toBeNonEmptyArray()

      expect(vm.menu.current).toBe('a')
      expect(vm.forest.nodeMap.a.isHighlighted).toBe(true)
    })
  })
})
