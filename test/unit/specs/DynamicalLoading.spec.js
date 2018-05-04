import Vue from 'vue'
import { mount } from '@vue/test-utils'
import sleep from 'yaku/lib/sleep'
import Treeselect from '@riophae/vue-treeselect/components/Treeselect'
import { CHECKED } from '@riophae/vue-treeselect/constants'
import {
  leftClick,
  findOptionByNodeId,
  findOptionArrowContainerByNodeId,
  findChildrenOptionListByNodeId,
} from './shared'

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
        'Are you meant to dynamically load options? You need to use `loadOptions` prop.',
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
        'Unloaded branch node detected. `loadOptions` prop is required to load its children.',
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
        data: {
          isOpen: true, // requires the menu to be open
        },
      })
      const { vm } = wrapper

      expect(vm.nodeMap.a.isExpanded).toBe(false) // collapsed by default
      vm.toggleExpanded(vm.nodeMap.a) // expand it
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
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper
      let childrenOptionList

      // children awaits to be loaded
      expect(vm.nodeMap.a.children).toBeEmptyArray()
      // collapsed by default
      expect(vm.nodeMap.a.isExpanded).toBe(false)
      // other things...
      expect(vm.nodeMap.a.isPending).toBe(false)
      expect(vm.nodeMap.a.isLoaded).toBe(false)
      // expand it
      vm.toggleExpanded(vm.nodeMap.a)
      expect(spyForLoadOptions).toHaveBeenCalled()
      expect(vm.nodeMap.a.isPending).toBe(true)
      childrenOptionList = findChildrenOptionListByNodeId(wrapper, 'a')
      // show loading spinner
      expect(childrenOptionList.contains('.vue-treeselect__loading-tip')).toBe(true)

      // wait for `callback()` to be called
      await sleep(DELAY)
      // options should be reinitilaized
      expect(vm.nodeMap.a.children).toBeNonEmptyArray()
      expect(vm.nodeMap.a.isLoaded).toBe(true)
      expect(vm.nodeMap.a.isPending).toBe(false)
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
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper
      let optionArrowWrapper
      let childrenOptionList

      // 1st try
      optionArrowWrapper = findOptionArrowContainerByNodeId(wrapper, 'a')
      leftClick(optionArrowWrapper) // expand
      expect(spyForLoadOptions.calls.count()).toBe(1)
      await sleep(DELAY)
      childrenOptionList = findChildrenOptionListByNodeId(wrapper, 'a')
      // should show error tip
      expect(childrenOptionList.contains('.vue-treeselect__error-tip')).toBe(true)
      const errorText = childrenOptionList.find('.vue-treeselect__error-tip-text').text()
      expect(errorText.includes(ERROR_MESSAGE)).toBe(true)
      expect(vm.nodeMap.a.loadingChildrenError).toBe(ERROR_MESSAGE)

      // 2nd try - click on retry
      const retry = wrapper.find('.vue-treeselect__retry')
      retry.element.click()
      expect(spyForLoadOptions.calls.count()).toBe(2)
      // should reset state
      expect(vm.nodeMap.a.isPending).toBe(true)
      expect(vm.nodeMap.a.loadingChildrenError).toBe('')
      await sleep(DELAY)
      childrenOptionList = findChildrenOptionListByNodeId(wrapper, 'a')
      // still shows the error tip
      expect(childrenOptionList.contains('.vue-treeselect__error-tip')).toBe(true)

      // 3nd try - collapse & re-expand
      optionArrowWrapper = findOptionArrowContainerByNodeId(wrapper, 'a')
      leftClick(optionArrowWrapper) // collapse
      leftClick(optionArrowWrapper) // re-expand
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
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper

      vm.toggleExpanded(vm.nodeMap.a)
      expect(spyForLoadOptions.calls.count()).toBe(1)

      await sleep(DELAY / 2)
      expect(vm.nodeMap.a.isPending).toBe(true)
      vm.toggleExpanded(vm.nodeMap.a) // collapse
      await vm.$nextTick()
      vm.toggleExpanded(vm.nodeMap.a) // re-expand
      await vm.$nextTick()
      expect(spyForLoadOptions.calls.count()).toBe(1) // but not triggers another loading

      await sleep(DELAY / 2)
      expect(vm.nodeMap.a.children).toBeNonEmptyArray()
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
          loadOptions({ parentNode, callback }) {
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
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper

      vm.select(vm.nodeMap.a)
      expect(vm.internalValue).toEqual([ 'a' ])
      expect(vm.selectedNodeIds).toEqual([ 'a' ])
      expect(vm.nodeCheckedStateMap).toEqual({
        a: CHECKED,
      })

      vm.toggleExpanded(vm.nodeMap.a)
      await vm.$nextTick()
      expect(called).toBe(1)
      expect(vm.internalValue).toEqual([ 'a' ])
      expect(vm.selectedNodeIds).toEqual([ 'a', 'aa', 'ab' ])
      expect(vm.nodeCheckedStateMap).toEqual({
        a: CHECKED,
        aa: CHECKED,
        ab: CHECKED,
      })

      vm.toggleExpanded(vm.nodeMap.aa)
      await vm.$nextTick()
      expect(called).toBe(2)
      expect(vm.internalValue).toEqual([ 'a' ])
      expect(vm.selectedNodeIds).toEqual([ 'a', 'aa', 'ab', 'aaa', 'aab' ])
      expect(vm.nodeCheckedStateMap).toEqual({
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
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper
      const getValueText = () => wrapper.find('.vue-treeselect__single-value').text().trim()

      expect(vm.nodeMap.aa).toEqual(jasmine.objectContaining({
        id: 'aa',
        label: 'aa (unknown)',
        isFallbackNode: true,
      }))
      expect(getValueText()).toBe('aa (unknown)')

      vm.toggleExpanded(vm.nodeMap.a)
      await sleep(DELAY)
      expect(vm.nodeMap.aa).toEqual(jasmine.objectContaining({
        id: 'aa',
        label: 'aa',
      }))
      expect(getValueText()).toBe('aa')
    })

    it('multiple instances share the same `loadOptions` function', async () => {
      const loadOptions = jasmine.createSpy('loadOptions')
      const { vm: vm1 } = mount(Treeselect, {
        propsData: {
          id: 1,
          loadOptions,
          options: [ {
            id: 'branch',
            label: 'branch',
            children: null,
          } ],
        },
        data: {
          isOpen: true,
        },
      })
      const { vm: vm2 } = mount(Treeselect, {
        propsData: {
          id: 2,
          loadOptions,
          options: [ {
            id: 'branch',
            label: 'branch',
            children: null,
          } ],
        },
        data: {
          isOpen: true,
        },
      })

      vm1.toggleExpanded(vm1.nodeMap.branch)
      await vm1.$nextTick()
      expect(loadOptions.calls.argsFor(0)).toEqual([ {
        id: 1,
        action: 'LOAD_CHILDREN_OPTIONS',
        parentNode: jasmine.any(Object),
        callback: jasmine.any(Function),
      } ])

      vm2.toggleExpanded(vm2.nodeMap.branch)
      await vm2.$nextTick()
      expect(loadOptions.calls.argsFor(1)).toEqual([ {
        id: 2,
        action: 'LOAD_CHILDREN_OPTIONS',
        parentNode: jasmine.any(Object),
        callback: jasmine.any(Function),
      } ])
    })

    it('callback can be executed only once', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          loadOptions({ parentNode, callback }) {
            parentNode.children = []
            callback()
            callback(new Error('test')) // this will be ignored
          },
        },
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper

      vm.toggleExpanded(vm.nodeMap.a)
      expect(vm.nodeMap.a.loadingChildrenError).toBe('')
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
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper

      vm.toggleExpanded(vm.nodeMap.a)
      await sleep(DELAY)
      expect(vm.nodeMap.a.loadingChildrenError).toBe('test')

      vm.toggleExpanded(vm.nodeMap.a)
      vm.toggleExpanded(vm.nodeMap.a)
      await sleep(DELAY)
      expect(vm.nodeMap.a.isLoaded).toBe(true)
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

      expect(vm.loadingRootOptions).toBe(false)

      vm.openMenu()
      await vm.$nextTick()

      const menu = vm.$refs.menu
      expect(vm.loadingRootOptions).toBe(true)
      // should show a loading tip
      expect(menu.firstElementChild.className).toEqual(jasmine.stringMatching('vue-treeselect__loading-tip'))
      expect(menu.firstElementChild.textContent.trim()).toBe('Loading...')

      await sleep(DELAY)
      expect(vm.loadingRootOptions).toBe(false)
      expect(vm.rootOptionsLoaded).toBe(true)
      // should hide the loading tip
      expect(menu.querySelector('.vue-treeselect__loading-tip')).toBe(null)
      // options should be registered
      expect(Object.keys(vm.nodeMap)).toEqual([ 'a', 'aa', 'b' ])
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
      expect(vm.loadingRootOptions).toBe(false)
      expect(vm.loadingRootOptionsError).toBe(ERROR_MESSAGE)
      expect(vm.rootOptionsLoaded).toBe(false)
      menu = vm.$refs.menu
      expect(menu.firstElementChild.className).toEqual(jasmine.stringMatching('vue-treeselect__error-tip'))
      expect(menu.querySelector('.vue-treeselect__error-tip-text').textContent.includes(ERROR_MESSAGE)).toBe(true)

      // 2nd try
      vm.closeMenu()
      vm.openMenu()
      // reset state
      expect(vm.loadingRootOptionsError).toBe('')
      await sleep(DELAY)
      expect(vm.loadingRootOptions).toBe(false)
      expect(vm.rootOptionsLoaded).toBe(true)
      menu = vm.$refs.menu
      expect(menu.querySelector('.vue-treeselect__error-tip')).toBe(null)
      // options should be registered
      expect(Object.keys(vm.nodeMap)).toEqual([ 'a', 'aa', 'b' ])
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
      expect(vm.loadingRootOptions).toBe(true)
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

      expect(vm.loadingRootOptions).toBe(true)
      expect(vm.nodeMap.a).toEqual(jasmine.objectContaining({
        id: 'a',
        label: 'a (unknown)',
        isFallbackNode: true,
      }))

      await sleep(DELAY)
      expect(vm.loadingRootOptions).toBe(false)
      expect(vm.nodeMap.a).toEqual(jasmine.objectContaining({
        id: 'a',
        label: 'a',
      }))
    })

    it('multiple instances share the same `loadOptions` function', () => {
      const loadOptions = jasmine.createSpy('loadOptions')
      const { vm: vm1 } = mount(Treeselect, {
        propsData: {
          id: 1,
          loadOptions,
          options: null,
          autoLoadRootOptions: false,
        },
      })
      const { vm: vm2 } = mount(Treeselect, {
        propsData: {
          id: 2,
          loadOptions,
          options: null,
          autoLoadRootOptions: false,
        },
      })

      vm1.openMenu()
      expect(loadOptions.calls.argsFor(0)).toEqual([ {
        id: 1,
        action: 'LOAD_ROOT_OPTIONS',
        callback: jasmine.any(Function),
      } ])

      vm2.openMenu()
      expect(loadOptions.calls.argsFor(1)).toEqual([ {
        id: 2,
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
      expect(vm.loadingRootOptionsError).toBe('test')
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
      expect(vm.loadingRootOptionsError).toBe('test')

      vm.closeMenu()
      vm.openMenu()
      await sleep(DELAY)
      expect(vm.rootOptionsLoaded).toBe(true)
    })
  })
})
