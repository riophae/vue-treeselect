export function removeFromArray(arr, elem) {
  const idx = arr.indexOf(elem)
  if (idx !== -1) arr.splice(idx, 1)
}
