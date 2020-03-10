// Magic value that indicates a root level node.
export const NO_PARENT_NODE = null

// Types of checked state.
export const UNCHECKED = 0
export const INDETERMINATE = 1
export const CHECKED = 2

// Types of count number.
export const ALL_CHILDREN = 'ALL_CHILDREN'
export const ALL_DESCENDANTS = 'ALL_DESCENDANTS'
export const LEAF_CHILDREN = 'LEAF_CHILDREN'
export const LEAF_DESCENDANTS = 'LEAF_DESCENDANTS'

// Action types of delayed loading.
export const LOAD_ROOT_OPTIONS = 'LOAD_ROOT_OPTIONS'
export const LOAD_CHILDREN_OPTIONS = 'LOAD_CHILDREN_OPTIONS'
export const ASYNC_SEARCH = 'ASYNC_SEARCH'

// Acceptable values of `valueConsistsOf` prop.
export const ALL = 'ALL'
export const BRANCH_PRIORITY = 'BRANCH_PRIORITY'
export const LEAF_PRIORITY = 'LEAF_PRIORITY'
export const ALL_WITH_INDETERMINATE = 'ALL_WITH_INDETERMINATE'

// Acceptable values of `sortValueBy` prop.
export const ORDER_SELECTED = 'ORDER_SELECTED'
export const LEVEL = 'LEVEL'
export const INDEX = 'INDEX'

// Key codes look-up table.
export const KEY_CODES = {
  BACKSPACE: 8,
  ENTER: 13,
  ESCAPE: 27,
  END: 35,
  HOME: 36,
  ARROW_LEFT: 37,
  ARROW_UP: 38,
  ARROW_RIGHT: 39,
  ARROW_DOWN: 40,
  DELETE: 46,
}

// Other constants.
export const INPUT_DEBOUNCE_DELAY = process.env.NODE_ENV === 'testing'
  ? /* to speed up unit testing */ 10
  : /* istanbul ignore next */ 200
export const MIN_INPUT_WIDTH = 5
export const MENU_BUFFER = 40
