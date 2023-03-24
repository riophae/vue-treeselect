// from react-select
export function scrollIntoView($scrollingEl, $focusedEl) {
  const scrollingReact = $scrollingEl.getBoundingClientRect()
  const focusedRect = $focusedEl.getBoundingClientRect()
  const overScroll = $focusedEl.offsetHeight / 3

  if (focusedRect.bottom + overScroll > scrollingReact.bottom) {
    $scrollingEl.scrollTop = Math.min(
      $focusedEl.offsetTop + $focusedEl.clientHeight - $scrollingEl.offsetHeight + overScroll,
      $scrollingEl.scrollHeight,
    )
  } else if (focusedRect.top - overScroll < scrollingReact.top) {
    $scrollingEl.scrollTop = Math.max($focusedEl.offsetTop - overScroll, 0)
  }
}
