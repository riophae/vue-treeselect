import * as utils from '../../../src/utils'

describe('Utils', () => {
  it('hasOwn', () => {
    const { hasOwn } = utils
    const objectWithoutPrototypes = Object.create(null)
    const normalObject = {}
    expect(hasOwn(objectWithoutPrototypes, 'key')).toBe(false)
    expect(hasOwn(normalObject, 'key')).toBe(false)
    objectWithoutPrototypes.key = true
    normalObject.key = true
    expect(hasOwn(objectWithoutPrototypes, 'key')).toBe(true)
    expect(hasOwn(normalObject, 'key')).toBe(true)
  })

  it('deepExtend', () => {
    const { deepExtend } = utils
    expect(deepExtend({}, undefined)).toEqual({})
    expect(deepExtend({}, null)).toEqual({})
    expect(deepExtend({ b: 2 }, { a: 1, c: 3 })).toEqual({ a: 1, b: 2, c: 3 })
    // expect(deepExtend({}, [])).toEqual({})
  })

  it('last', () => {
    const { last } = utils
    expect(last([])).toBe(undefined)
    expect(last([ 1 ])).toBe(1)
    expect(last([ 1, 2, 3 ])).toBe(3)
  })

  it('findIndex', () => {
    const { findIndex } = utils
    expect(findIndex([ 1, 2, 3 ], n => n % 2 === 0)).toBe(1)
  })

  it('removeFromArray', () => {
    const { removeFromArray } = utils
    const arr = [ 1, 2, 3 ]
    removeFromArray(arr, 2)
    expect(arr).toEqual([ 1, 3 ])
    removeFromArray(arr, 9)
    expect(arr).toEqual([ 1, 3 ])
  })

  it('quickCompare', () => {
    const { quickCompare } = utils
    const obj = {}
    expect(quickCompare([], [])).toBe(true)
    expect(quickCompare([ 1 ], [])).toBe(false)
    expect(quickCompare([ {} ], [ {} ])).toBe(false)
    expect(quickCompare([ obj ], [ obj ])).toBe(true)
  })
})
