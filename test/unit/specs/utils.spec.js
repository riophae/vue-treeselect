import * as utils from '../../../src/utils'

describe('Utils', () => {
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

  it('unreachable', () => {
    const { unreachable } = utils
    spyOn(console, 'error')
    unreachable()
    expect(console.error).toHaveBeenCalledWith('[Vue-Treeselect Error] You should not reach here.')
  })

  describe('onlyOnLeftClick', () => {
    const { onlyOnLeftClick } = utils
    let spy

    beforeEach(() => {
      spy = jasmine.createSpy('onmousedown')
    })

    it('should invoke the function when left button has been clicked', () => {
      const eventObj = {
        type: 'mousedown',
        button: 0,
      }
      onlyOnLeftClick(spy)(eventObj)
      expect(spy).toHaveBeenCalledWith(eventObj)
    })

    it('should not invoke the function if wrong event type', () => {
      const eventObj = {
        type: 'mouseup',
        button: 0,
      }
      onlyOnLeftClick(spy)(eventObj)
      expect(spy).not.toHaveBeenCalled()
    })

    it('should not invoke the function if clicked with buttons other than left button', () => {
      const eventObj = {
        type: 'mousedown',
        button: 1,
      }
      onlyOnLeftClick(spy)(eventObj)
      expect(spy).not.toHaveBeenCalled()
    })

    it('should pass extra args', () => {
      const eventObj = {
        type: 'mousedown',
        button: 0,
      }
      const extraArg = {}
      onlyOnLeftClick(spy)(eventObj, extraArg)
      expect(spy).toHaveBeenCalledWith(eventObj, extraArg)
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

    it('should throw an error if source is not a plain object', () => {
      spyOn(console, 'error')
      deepExtend({}, [])
      expect(console.error).toHaveBeenCalledWith('[Vue-Treeselect Error] You should not reach here.')
    })
  })

  describe('last', () => {
    const { last } = utils

    it('returns undefined if array is empty', () => {
      expect(last([])).toBe(undefined)
    })

    it('returns last element of array', () => {
      expect(last([ 1 ])).toBe(1)
      expect(last([ 1, 2, 3 ])).toBe(3)
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

  it('quickDiff', () => {
    const { quickDiff } = utils
    const obj = {}
    expect(quickDiff([], [])).toBe(false)
    expect(quickDiff([ 1 ], [])).toBe(true)
    expect(quickDiff([ {} ], [ {} ])).toBe(true)
    expect(quickDiff([ obj ], [ obj ])).toBe(false)
  })
})
