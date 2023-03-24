/* eslint import/namespace: 0 */

import sleep from 'yaku/lib/sleep'
import * as utils from '@src/utils'

describe('Utils', () => {
  describe('Debugging Helpers', () => {
    describe('warning', () => {
      const { warning } = utils
      const WARNING_MSG = '$MESSAGE$'

      beforeEach(() => {
        spyOn(console, 'error')
      })

      it('when true', () => {
        warning(() => true, () => WARNING_MSG)
        expect(console.error).not.toHaveBeenCalled()
      })

      it('when false', () => {
        warning(() => false, () => WARNING_MSG)
        expect(console.error).toHaveBeenCalledWith('[Vue-Treeselect Warning]', WARNING_MSG)
      })
    })
  })

  describe('DOM Utilites', () => {
    describe('onLeftClick', () => {
      const { onLeftClick } = utils
      let spy

      beforeEach(() => {
        spy = jasmine.createSpy('onmousedown')
      })

      it('should invoke the function when left button has been clicked', () => {
        const eventObj = {
          type: 'mousedown',
          button: 0,
        }
        onLeftClick(spy)(eventObj)
        expect(spy).toHaveBeenCalledWith(eventObj)
      })

      it('should not invoke the function if wrong event type', () => {
        const eventObj = {
          type: 'mouseup',
          button: 0,
        }
        onLeftClick(spy)(eventObj)
        expect(spy).not.toHaveBeenCalled()
      })

      it('should not invoke the function if clicked with buttons other than left button', () => {
        const eventObj = {
          type: 'mousedown',
          button: 1,
        }
        onLeftClick(spy)(eventObj)
        expect(spy).not.toHaveBeenCalled()
      })

      it('should pass extra args', () => {
        const eventObj = {
          type: 'mousedown',
          button: 0,
        }
        const extraArg = {}
        onLeftClick(spy)(eventObj, extraArg)
        expect(spy).toHaveBeenCalledWith(eventObj, extraArg)
      })
    })

    it('scrollIntoView', () => {
      // TODO
    })

    it('debounce', () => {
      // vendor codes
    })

    describe('watchSize', () => {
      const { watchSize } = utils

      let $el
      let height
      let log
      const wait = 100

      const listener = (...args) => {
        log.push(args)
      }
      const enlarge = () => {
        $el.style.height = (height += 10) + 'px'
      }
      const reset = () => {
        $el = document.createElement('div')
        $el.style.height = (height = 100) + 'px'
        $el.style.position = 'relative'
        document.body.append($el)
        log = []
      }
      const cleanup = () => {
        $el.remove()
      }
      const test = async () => {
        reset()

        const unwatch = watchSize($el, listener)
        expect(log).toBeArrayOfSize(0)

        enlarge()
        await sleep(wait)
        expect(log).toBeArrayOfSize(1)
        expect(log[0][0].height).toBe(110)

        enlarge()
        await sleep(wait)
        expect(log).toBeArrayOfSize(2)
        expect(log[1][0].height).toBe(120)

        unwatch()
        cleanup()
      }

      it('for browsers other than IE9', async () => {
        await test()
      })

      it('for IE9', async () => {
        document.documentMode = 9
        await test()
        delete document.documentMode
      })
    })

    it('setupResizeAndScrollEventListeners', async () => {
      const { setupResizeAndScrollEventListeners } = utils

      let child, parent, grandparent, called

      const init = () => {
        grandparent = document.createElement('div')
        // eslint-disable-next-line unicorn/prefer-node-append
        parent = grandparent.appendChild(document.createElement('div'))
        parent.style.overflow = 'auto'
        parent.style.height = '100px'
        // eslint-disable-next-line unicorn/prefer-node-append
        child = parent.appendChild(document.createElement('div'))
        child.style.height = '99999px'
        document.body.append(grandparent)
        called = 0
      }
      const cleanup = () => {
        parent.remove()
      }
      const trigger = ($el, type) => {
        const event = document.createEvent('Event')
        event.initEvent(type, true, true)
        $el.dispatchEvent(event)
      }
      const test = async () => {
        init()

        const listener = () => called++
        const unwatch = setupResizeAndScrollEventListeners(child, listener)

        parent.scrollTop += 100
        await sleep(16)
        expect(called).toBe(1)

        parent.scrollTop -= 100
        await sleep(16)
        expect(called).toBe(2)

        trigger(window, 'scroll')
        await sleep(16)
        expect(called).toBe(3)

        trigger(window, 'resize')
        await sleep(16)
        expect(called).toBe(4)

        trigger(window, 'scroll')
        await sleep(16)
        expect(called).toBe(5)

        trigger(window, 'resize')
        await sleep(16)
        expect(called).toBe(6)

        unwatch()

        parent.scrollTop += 100
        await sleep(16)
        expect(called).toBe(6)

        trigger(window, 'scroll')
        await sleep(16)
        expect(called).toBe(6)

        trigger(window, 'resize')
        await sleep(16)
        expect(called).toBe(6)

        cleanup()
      }

      await test()
    })
  })

  describe('Language Helpers', () => {
    describe('isNaN', () => {
      const { isNaN } = utils

      it('check if value is NaN', () => {
        expect(isNaN(NaN)).toBe(true)
        expect(isNaN(0)).toBe(false)
        expect(isNaN(-1)).toBe(false)
        expect(isNaN(1)).toBe(false)
        expect(isNaN('NaN')).toBe(false)
      })
    })

    it('isPromise', () => {
      // vender codes
    })

    it('once', () => {
      // vender codes
    })

    it('noop', () => {
      // vender codes
    })

    it('identity', () => {
      // vender codes
    })

    it('constant', () => {
      // vender codes
    })

    describe('createMap', () => {
      const { createMap } = utils

      it('prototype should be null', () => {
        expect(Object.getPrototypeOf(createMap())).toBe(null)
      })
    })

    describe('deepExtend', () => {
      const { deepExtend } = utils

      it('should deep extend the target object', () => {
        expect(deepExtend({ b: 2 }, { a: 1, c: 3 })).toEqual({ a: 1, b: 2, c: 3 })
      })

      it('should work with undefined/null', () => {
        expect(deepExtend({}, undefined)).toEqual({})
        expect(deepExtend({}, null)).toEqual({})
      })
    })

    it('last', () => {
      // vendor codes
    })

    describe('includes', () => {
      const { includes } = utils

      it('string', () => {
        expect(includes('abc', 'ab')).toBe(true)
        expect(includes('xyz', 'bc')).toBe(false)
      })

      it('array', () => {
        expect(includes([ 'a', 'b', 'c' ], 'b')).toBe(true)
        expect(includes([ 'x', 'y', 'z' ], 'b')).toBe(false)
      })
    })

    describe('find', () => {
      const { find } = utils

      it('should return the element if matched', () => {
        expect(find([ 1, 2, 3 ], n => n % 2 === 0)).toBe(2)
      })

      it('should return undefined if not matched', () => {
        expect(find([ 1 ], n => n < 0)).toBe(undefined)
      })
    })

    it('removeFromArray', () => {
      const { removeFromArray } = utils
      const arr = [ 1, 2, 3 ]
      removeFromArray(arr, 2)
      expect(arr).toEqual([ 1, 3 ])
      removeFromArray(arr, 9)
      expect(arr).toEqual([ 1, 3 ])
    })
  })

  describe('Other Utilities', () => {
    it('quickDiff', () => {
      const { quickDiff } = utils
      const obj = {}
      expect(quickDiff([], [])).toBe(false)
      expect(quickDiff([ 1 ], [])).toBe(true)
      expect(quickDiff([ {} ], [ {} ])).toBe(true)
      expect(quickDiff([ obj ], [ obj ])).toBe(false)
    })
  })
})
