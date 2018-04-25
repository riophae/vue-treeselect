export const NO_PARENT_NODE = null

export const UNCHECKED = 0
export const INDETERMINATE = 1
export const CHECKED = 2

export const UNMATCHED = 0
export const DESCENDANT_MATCHED = 1
export const MATCHED = 2

export const LOAD_ROOT_OPTIONS = 'LOAD_ROOT_OPTIONS'
export const LOAD_CHILDREN_OPTIONS = 'LOAD_CHILDREN_OPTIONS'
export const ASYNC_SEARCH = 'ASYNC_SEARCH'

export const ALL = 'ALL'
export const BRANCH_PRIORITY = 'BRANCH_PRIORITY'
export const LEAF_PRIORITY = 'LEAF_PRIORITY'

export const ALL_CHILDREN = 'ALL_CHILDREN'
export const ALL_DESCENDANTS = 'ALL_DESCENDANTS'
export const LEAF_CHILDREN = 'LEAF_CHILDREN'
export const LEAF_DESCENDANTS = 'LEAF_DESCENDANTS'

export const ORDER_SELECTED = 'ORDER_SELECTED'
export const LEVEL = 'LEVEL'
export const INDEX = 'INDEX'

export const INPUT_DEBOUNCE_DELAY = process.env.NODE_ENV === 'testing'
  ? 10
  : /* istanbul ignore next */ 200
export const MIN_INPUT_WIDTH = 5
export const KEEP_REMAINING_HEIGHT = 40

export const KEY_CODES = {
  BACKSPACE: 8,
  ESCAPE: 27,
  DELETE: 46,
}
