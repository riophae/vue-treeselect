export const warning = process.env.NODE_ENV === 'production'
  ? /* istanbul ignore next */ noop
  : function warning(checker, complainer) {
    if (!checker()) {
      const message = [ '[Vue-Treeselect Warning]' ].concat(complainer())
      // eslint-disable-next-line no-console
      console.error(...message)
      // eslint-disable-next-line no-debugger
      debugger
    }
  }

export const unreachable = process.env.NODE_ENV === 'production'
  ? /* istanbul ignore next */ noop
  : function unreachable() {
    // eslint-disable-next-line no-console
    console.error('[Vue-Treeselect Error] You should not reach here.')
    // eslint-disable-next-line no-debugger
    debugger
  }

export function onlyOnLeftClick(mouseDownHandler) {
  return function onMouseDown(evt) {
    if (evt.type === 'mousedown' && evt.button === 0) {
      mouseDownHandler.call(this, evt)
    }
  }
}

export function noop() {
  /* istanbul ignore next */
}

function isPlainObject(value) {
  if (value == null || typeof value !== 'object') return false
  return Object.getPrototypeOf(value) === Object.prototype
}

function copy(obj, key, value) {
  if (isPlainObject(value)) {
    obj[key] || (obj[key] = {})
    deepExtend(obj[key], value)
  } else {
    obj[key] = value
  }
}

export function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export function deepExtend(target, source) {
  if (source == null) {
    // empty
  } else if (isPlainObject(source)) {
    const keys = Object.keys(source)
    for (let i = 0, len = keys.length; i < len; i++) {
      copy(target, keys[i], source[keys[i]])
    }
  } else {
    unreachable()
  }

  return target
}

export function last(arr) {
  warning(
    () => Array.isArray(arr),
    () => 'unexpected type',
  )
  return arr[arr.length - 1]
}

export function findIndexFallback(arr, predicate, ctx) {
  for (let i = 0, len = arr.length; i < len; i++) {
    if (predicate.call(ctx, arr[i], i, arr)) return i
  }

  return -1
}

export function findIndex(arr, predicate, ctx) {
  return typeof Array.prototype.findIndex === 'function'
    ? arr.findIndex(predicate, ctx)
    : findIndexFallback(arr, predicate, ctx)
}

export function removeFromArray(arr, elem) {
  const idx = arr.indexOf(elem)
  if (idx !== -1) arr.splice(idx, 1)
}

export function quickCompare(arrA, arrB) {
  if (arrA.length !== arrB.length) return false

  for (let i = 0; i < arrA.length; i++) {
    if (arrA[i] !== arrB[i]) return false
  }

  return true
}
