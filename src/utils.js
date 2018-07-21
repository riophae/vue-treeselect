/**
 * Debugging helpers
 */

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

/**
 * Dom utilites
 */

export function onLeftClick(mouseDownHandler) {
  return function onMouseDown(evt, ...args) {
    if (evt.type === 'mousedown' && evt.button === 0) {
      mouseDownHandler.call(this, evt, ...args)
    }
  }
}

// from react-select
export function scrollIntoView($scrollingEl, $focusedEl) {
  const scrollingReact = $scrollingEl.getBoundingClientRect()
  const focusedRect = $focusedEl.getBoundingClientRect()
  const overScroll = $focusedEl.offsetHeight / 3

  if (focusedRect.bottom + overScroll > scrollingReact.bottom) {
    $scrollingEl.scrollTop = Math.min(
      $focusedEl.offsetTop + $focusedEl.clientHeight - $scrollingEl.offsetHeight + overScroll,
      $scrollingEl.scrollHeight
    )
  } else if (focusedRect.top - overScroll < scrollingReact.top) {
    $scrollingEl.scrollTop = Math.max($focusedEl.offsetTop - overScroll, 0)
  }
}

import watchSizeForBrowsersOtherThanIE9 from 'watch-size'

/* eslint-disable indent */
// istanbul ignore next
const watchSizeForIE9 = (() => {
  let running = false
  let intervalId
  const registered = []
  const INTERVAL_DURATION = 100

  function run() {
    if (running) return
    running = true

    intervalId = setInterval(() => {
      registered.forEach(test)
    }, INTERVAL_DURATION)
  }

  function stop() {
    if (!running) return
    running = false

    clearInterval(intervalId)
    intervalId = null
  }

  function test(item) {
    const { $el, listener, lastWidth, lastHeight } = item
    const width = $el.offsetWidth
    const height = $el.offsetHeight

    if (lastWidth !== width || lastHeight !== height) {
      item.lastWidth = width
      item.lastHeight = height

      listener({ width, height })
    }
  }

  return ($el, listener) => {
    const item = {
      $el,
      listener,
      lastWidth: null,
      lastHeight: null,
    }
    const unwatch = () => {
      removeFromArray(registered, item)
      if (!registered.length) stop()
    }

    registered.push(item)
    // The original watch-size will call the listener on initialization.
    // Keep the same behavior here.
    test(item)
    run()

    return unwatch
  }
})()
/* eslint-enable indent */

export function watchSize($el, listener) {
  // See: https://stackoverflow.com/a/31293352
  const isIE9 = document.documentMode === 9
  // watch-size will call the listener on initialization.
  // Disable this behavior with a lock to achieve a clearer code logic.
  let locked = true
  const wrappedListener = (...args) => locked || listener(...args)
  const implementation = isIE9
    ? watchSizeForIE9
    : watchSizeForBrowsersOtherThanIE9
  const removeSizeWatcher = implementation($el, wrappedListener)
  locked = false // unlock after initialization

  return removeSizeWatcher
}

/**
 * Language helpers
 */

export function isNaN(x) {
  return x !== x
}

// https://github.com/then/is-promise/blob/master/index.js
export function isPromise(x) {
  return (
    x != null &&
    (typeof x === 'object' || typeof x === 'function') &&
    typeof x.then === 'function'
  )
}

export function once(fn) {
  const wrapper = (...args) => {
    if (fn.called) return wrapper.val
    fn.called = true
    return wrapper.val = fn(...args)
  }
  return wrapper
}

export function noop() {
  // empty
}

export function identity(x) {
  return x
}

export function constant(x) {
  return () => x
}

export function createMap() {
  return Object.create(null)
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

export function deepExtend(target, source) {
  if (isPlainObject(source)) {
    const keys = Object.keys(source)
    for (let i = 0, len = keys.length; i < len; i++) {
      copy(target, keys[i], source[keys[i]])
    }
  }

  return target
}

export function getLast(arr) {
  return arr[arr.length - 1]
}

export function includes(arrOrStr, elem) {
  return arrOrStr.indexOf(elem) !== -1
}

export function find(arr, predicate, ctx) {
  for (let i = 0, len = arr.length; i < len; i++) {
    if (predicate.call(ctx, arr[i], i, arr)) return arr[i]
  }
  return undefined
}

export function removeFromArray(arr, elem) {
  const idx = arr.indexOf(elem)
  if (idx !== -1) arr.splice(idx, 1)
}

export function quickDiff(arrA, arrB) {
  if (arrA.length !== arrB.length) return true

  for (let i = 0; i < arrA.length; i++) {
    if (arrA[i] !== arrB[i]) return true
  }

  return false
}
