function findScrollParents($el) {
  const $scrollParents = []
  let $parent = $el.parentNode

  while ($parent && $parent.nodeName !== 'BODY' && $parent.nodeType === document.ELEMENT_NODE) {
    if (isScrollElment($parent)) $scrollParents.push($parent)
    $parent = $parent.parentNode
  }
  $scrollParents.push(window)

  return $scrollParents
}

function isScrollElment($el) {
  // Firefox wants us to check `-x` and `-y` variations as well
  const { overflow, overflowX, overflowY } = getComputedStyle($el)
  return /(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)
}

export function setupResizeAndScrollEventListeners($el, listener) {
  const $scrollParents = findScrollParents($el)

  window.addEventListener('resize', listener, { passive: true })
  $scrollParents.forEach(scrollParent => {
    scrollParent.addEventListener('scroll', listener, { passive: true })
  })

  return function removeEventListeners() {
    window.removeEventListener('resize', listener, { passive: true })
    $scrollParents.forEach($scrollParent => {
      $scrollParent.removeEventListener('scroll', listener, { passive: true })
    })
  }
}
