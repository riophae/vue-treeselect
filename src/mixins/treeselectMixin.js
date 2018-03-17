import fuzzysearch from 'fuzzysearch'
import debounce from 'lodash/debounce'
import {
  warning,
  quickCompare, onlyOnLeftClick,
  hasOwn, last, findIndex, removeFromArray,
} from '../utils'
import {
  UNCHECKED, INDETERMINATE, CHECKED,
  UNMATCHED, DESCENDANT_MATCHED, MATCHED,
  NO_PARENT_NODE,
  ALL_CHILDREN, ALL_DESCENDANTS, LEAF_CHILDREN, LEAF_DESCENDANTS,
  ORDER_SELECTED, LEVEL, INDEX,
} from '../constants'

function sortValueByIndex(a, b) {
  let i = 0
  do {
    if (a.level < i) return -1
    if (b.level < i) return 1
    if (a.index[i] !== b.index[i]) return a.index[i] - b.index[i]
    i++
  } while (true)
}

function sortValueByLevel(a, b) {
  return a.level !== b.level
    ? a.level - b.level
    : sortValueByIndex(a, b)
}

function limitTextDefault(count) {
  return `and ${count} more`
}

function loadChildrenErrorTextDefault(error) {
  const reason = error.message || /* istanbul ignore next */ String(error)
  return `Failed to load children options: ${reason}.`
}

export default {
  provide() {
    return {
      // enable access to the instance of root component of vue-treeselect across hierarchy
      instance: this,

      // constants
      UNCHECKED,
      INDETERMINATE,
      CHECKED,
      UNMATCHED,
      DESCENDANT_MATCHED,
      MATCHED,
    }
  },

  props: {
    /**
     * Autofocus the component on mount?
     * @default false
     * @type {boolean}
     */
    autofocus: {
      type: Boolean,
      default: false,
    },

    /**
     * Automatically load root options on mount?
     * @default true
     * @type {boolean}
     */
    autoLoadRootOptions: {
      type: Boolean,
      default: true,
    },

    /**
     * Whether the menu should be always open
     * @default false
     * @type {boolean}
     */
    alwaysOpen: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether pressing backspace removes the last item if there is no text input
     * @default true
     * @type {boolean}
     */
    backspaceRemoves: {
      type: Boolean,
      default: true,
    },

    /**
     * Show branch nodes before leaf nodes?
     * @default false
     * @type {boolean}
     */
    branchNodesFirst: {
      type: Boolean,
      default: false,
    },

    /**
     * Show an "×" icon that resets value?
     * @default true
     * @type {boolean}
     */
    clearable: {
      type: Boolean,
      default: true,
    },

    /**
     * Title for the "×" icon when multiple: true
     * @default "Clear all"
     * @type {string}
     */
    clearAllText: {
      type: String,
      default: 'Clear all',
    },

    /**
     * Whether to clear the search input after selecting.
     * Use only when `multiple` is `true`.
     * For single-select mode, it **always** clears the input after selecting an option regardless of the prop value.
     * @default false
     * @type {boolean}
     */
    clearOnSelect: {
      type: Boolean,
      default: false,
    },

    /**
     * Title for the "×" icon
     * @default "Clear value"
     * @type {string}
     */
    clearValueText: {
      type: String,
      default: 'Clear value',
    },

    /**
     * Whether to close the menu after selecting an option?
     * Use only when `multiple` is `true`.
     * @default true
     * @type {boolean}
     */
    closeOnSelect: {
      type: Boolean,
      default: true,
    },

    /**
     * Whether pressing delete key removes the last item if there is no text input
     * @default true
     * @type {boolean}
     */
    deleteRemoves: {
      type: Boolean,
      default: true,
    },

    /**
     * Prevent branch nodes from being selected?
     * @default false
     * @type {boolean}
     */
    disableBranchNodes: {
      type: Boolean,
      default: false,
    },

    /**
     * Disable the control?
     * @default false
     * @type {boolean}
     */
    disabled: {
      type: Boolean,
      default: false,
    },

    /**
     * How many levels of branch nodes should be automatically expanded when loaded.
     * Set `Infinity` to make all branch nodes expanded by default.
     * @default 0
     * @type {number}
     */
    defaultExpandLevel: {
      type: Number,
      default: 0,
    },

    /**
     * Whether escape clears the value when the menu is closed
     * @default true
     * @type {boolean}
     */
    escapeClearsValue: {
      type: Boolean,
      default: true,
    },

    /**
     * Whether to enable flat mode or not. Non-flat mode (default) means:
     *   - Whenever a branch node gets checked, all its children will be checked too
     *   - Whenever a branch node has all children checked, the branch node itself will be checked too
     * Set `true` to disable this mechanism
     * @default false
     * @type {boolean}
     */
    flat: {
      type: Boolean,
      default: false,
    },

    /**
     * Will be passed with all events as second param.
     * Useful for identifying events origin.
     * @default null
     * @type {string|number}
    */
    id: {
      default: null,
    },

    /**
     * Limit the display of selected options.
     * The rest will be hidden within the limitText string.
     * @default Infinity
     * @type {number}
     */
    limit: {
      type: Number,
      default: Infinity,
    },

    /**
     * Function that processes the message shown when selected elements pass the defined limit
     * @default count => `and ${count} more`
     * @type {function(number): string}
     */
    limitText: {
      type: Function,
      default: limitTextDefault,
    },

    /**
     * Function that processes error message shown when loading children options failed
     * @default error => `Failed to load children options: ${error.message || String(error)}.`
     * @type {function(Error): string}
     */
    loadChildrenErrorText: {
      type: Function,
      default: loadChildrenErrorTextDefault,
    },

    /**
     * Function used for dynamic loading options
     * @type {function}
     */
    loadChildrenOptions: {
      type: Function,
    },

    /**
     * Text displayed when a branch node is loading its children options
     * @default "Loading..."
     * @type {string}
     */
    loadingText: {
      type: String,
      default: 'Loading...',
    },

    /**
     * Function used for dynamic loading root options
     * @type {function}
     */
    loadRootOptions: {
      type: Function,
    },

    /**
     * Sets `maxHeight` style value of the menu
     * @default 300
     * @type {number}
     */
    maxHeight: {
      type: Number,
      default: 300,
    },

    /**
     * Set `true` to allow selecting multiple options (a.k.a., multi-select mode)
     * @default false
     * @type {boolean}
     */
    multiple: {
      type: Boolean,
      default: false,
    },

    /**
     * Text displayed when a branch node has no children options
     * @default "No children available..."
     * @type {string}
     */
    noChildrenText: {
      type: String,
      default: 'No children options...',
    },

    /**
     * Text displayed when there are no matching search results
     * @default "No results found..."
     * @type {string}
     */
    noResultsText: {
      type: String,
      default: 'No results found...',
    },

    /**
     * Text displayed when there are no available options
     * @default "No options available."
     * @type {string}
     */
    noOptionsText: {
      type: String,
      default: 'No options available.',
    },

    /**
     * Fixed opening direction
     * @default "auto"
     * @type {string}
     */
    openDirection: {
      type: String,
      default: 'auto',
    },

    /**
     * Whether to automatically open the menu when the control is clicked
     * @default true
     * @type {boolean}
     */
    openOnClick: {
      type: Boolean,
      default: true,
    },

    /**
     * Whether to automatically open the menu when the control is focused
     * @default false
     * @type {boolean}
     */
    openOnFocus: {
      type: Boolean,
      default: false,
    },

    /**
     * Array of available options
     * @type {Object[]}
     */
    options: {
      type: Array,
    },

    /**
     * Field placeholder, displayed when there's no value.
     * @default "Selecting..."
     * @type {string}
     */
    placeholder: {
      type: String,
      default: 'Select...',
    },

    /**
     * Whether to retain the scroll position on menu reopen
     * @type {boolean}
     */
    retainScrollPosition: {
      type: Boolean,
      default: true,
    },

    /**
     * Text displayed asking user whether to retry loading children options
     * @default "Retry?"
     * @type {string}
     */
    retryText: {
      type: String,
      default: 'Retry?',
    },

    /**
     * Title for the retry button
     * @default "Click to retry"
     * @type {string}
     */
    retryTitle: {
      type: String,
      default: 'Click to retry',
    },

    /**
     * Enable searching feature?
     * @default true
     * @type {boolean}
     */
    searchable: {
      type: Boolean,
      default: true,
    },

    /**
     * Whether to show a children count next to the label of each branch node
     * @default false
     * @type {boolean}
     */
    showCount: {
      type: Boolean,
      default: false,
    },

    /**
     * Used in pairs with `showCount` specifying what count should be displayed.
     * Acceptable values:
     *   - "ALL_CHILDREN"
     *   - "ALL_DESCENDANTS"
     *   - "LEAF_CHILDREN"
     *   - "LEAF_DESCENDANTS"
     * @default "ALL_CHILDREN"
     * @type {string}
     */
    showCountOf: {
      type: String,
      default: ALL_CHILDREN,
      validator(value) {
        const expectedValues = [ ALL_CHILDREN, ALL_DESCENDANTS, LEAF_CHILDREN, LEAF_DESCENDANTS ]
        return expectedValues.indexOf(value) !== -1
      },
    },

    /**
     * Whether to show children count when searching.
     * Fallbacks to the value of `showCount` when not specified.
     * @type {boolean}
     */
    showCountOnSearch: null,

    /**
     * In which order the selected options should be displayed.
     * Acceptable values:
     *   - "ORDER_SELECTED"
     *   - "LEVEL"
     *   - "INDEX"
     * @default "ORDER_SELECTED"
     * @type {string}
     */
    sortValueBy: {
      type: String,
      default: ORDER_SELECTED,
    },

    /**
     * TODO
     */
    subItemsLimit: {
      type: Number,
      default: Infinity,
    },

    /**
     * Tab index of the control
     * @default 0
     * @type {number}
     */
    tabIndex: {
      type: Number,
      default: 0,
    },

    /**
     * An array of node ids as the initial field value
     * @type {?Array}
     */
    value: null,
  },

  data: () => ({
    internalValue: [],
    isFocused: false, // whether the control has been focused
    isOpen: false, // whether the menu is open
    nodeCheckedStateMap: Object.create(null), // used for multi-select mode
    nodeMap: Object.create(null), // map: nodeId -> node
    normalizedOptions: null, // normalized options tree
    noSearchResults: true, // whether there is any matching search results
    optimizedHeight: 0,
    prefferedOpenDirection: 'below',
    rootOptionsLoaded: false,
    loadingRootOptions: false,
    loadingRootOptionsError: '',
    searchingCount: Object.create(null),
    searching: false,
    searchQuery: '',
    selectedNodeMap: Object.create(null),
    lastScrollPosition: 0,
  }),

  computed: {
    /* eslint-disable valid-jsdoc */
    /**
     * How many options has been selected
     * @type {number}
     */
    selectedNodesNumber() {
      return this.internalValue.length
    },

    /**
     * Has any option been selected?
     * @type {boolean}
     */
    hasValue() {
      return this.selectedNodesNumber > 0
    },

    /**
     * Has any undisabled option been selected?
     * @type {boolean}
     */
    hasUndisabledValue() {
      return this.hasValue && this.selectedNodes.some(node => !node.isDisabled)
    },

    /**
     * Normalized options that has been selected
     * @type {Object[]}
     */
    selectedNodes() {
      return this.internalValue.map(this.getNode)
    },

    /**
     * Whether is single-select mode or not
     * @type {boolean}
     */
    single() {
      return !this.multiple
    },

    /**
     * Options displayed in the control, the upper limit of number of which is
     * equal to the value of `limit` prop
     * @type {Object[]}
     */
    visibleValue() {
      return this.selectedNodes.slice(0, this.limit)
    },

    /**
     * Whether has passed the defined limit or not
     * @type {boolean}
     */
    hasExceededLimit() {
      return this.selectedNodesNumber > this.limit
    },

    /**
     * Should the "×" icon be shown?
     * @type {boolean}
     */
    shouldShowClearIcon() {
      return this.clearable && !this.disabled && this.hasUndisabledValue
    },

    /**
     * Should show children count when searching?
     * @type {boolean}
     */
    showCountOnSearchComputed() {
      // Vue not allows set default prop value based on another prop value
      // so use computed property as a workaround
      return typeof this.showCountOnSearch === 'boolean'
        ? this.showCountOnSearch
        : this.showCount
    },
    /* eslint-enable valid-jsdoc */
  },

  watch: {
    alwaysOpen(newValue) {
      if (newValue) this.openMenu()
      else this.closeMenu()
    },

    disabled(newValue) {
      // force close the menu after disabling the control
      if (newValue && this.isOpen) this.closeMenu()
      if (!newValue && !this.isOpen && this.alwaysOpen) this.openMenu()
    },

    multiple(newValue) {
      if (newValue) {
        // needs to rebuild the state tree when switching from
        // single-select mode to multi-select mode
        this.buildNodeCheckedStateMap()
      }
    },

    searchQuery: debounce(function onSearchQueryChange() {
      this.handleSearch()
      this.$emit('search-change', this.searchQuery, this.id)
    }, 200),

    sortValueBy() {
      // re-sort value when value of `sortValueBy` prop has changed
      this.sortValue()
    },

    internalValue() {
      this.$emit('input', this.getValue(), this.id)
    },

    value(newValue) {
      const _newValue = (!newValue && newValue !== 0)
        ? []
        : this.multiple
          ? newValue.slice()
          : [ newValue ]
      const hasChanged = !quickCompare(_newValue, this.internalValue)

      if (hasChanged) {
        this.internalValue = _newValue
        this.buildSelectedNodeMap()
        this.buildNodeCheckedStateMap()
      }
    },
  },

  methods: {
    verifyProps() {
      if (!this.loadRootOptions) {
        if (!this.options) {
          warning(
            () => false,
            () => 'Required prop `options` is not provided.'
          )
        } else if (!Array.isArray(this.options)) {
          warning(
            () => false,
            () => `Expected prop \`options\` to be an array, instead got: ${this.options}.`
          )
        }
      }
    },

    resetFlags() {
      this._blurOnSelect = false
      this._wasClickedOnValueItem = false
    },

    initialize(rootOptions) {
      if (Array.isArray(rootOptions)) this.rootOptionsLoaded = true
      this.initializeRootOptions(rootOptions || [])
      this.initializeValue()
      this.buildSelectedNodeMap()
      this.buildNodeCheckedStateMap()
    },

    getValue() {
      return this.multiple
        ? this.internalValue.slice()
        : this.internalValue[0]
    },

    getNode(nodeId) {
      warning(
        () => nodeId != null,
        () => `Invalid node id: ${nodeId}`
      )

      return this.nodeMap[nodeId] || {
        id: nodeId,
        label: `${nodeId} (unknown)`,
        ancestors: [],
        parentNode: NO_PARENT_NODE,
        isUnknownNode: true,
        isLeaf: true,
        isBranch: false,
      }
    },

    isSelected(node) {
      // whether a node is selected (single-select mode) or fully-checked (multi-select mode)
      return node.id in this.selectedNodeMap
    },

    withoutDisabled(nodes) {
      return nodes.filter(node => !node.isDisabled)
    },

    checkIfBranchNode(node) {
      warning(
        () => node && node.isBranch,
        /* istanbul ignore next */
        () => `Expected a branch node, instead got: ${node}`
      )
    },

    traverseDescendants(parentNode, maxLevel, callback) {
      if (typeof maxLevel === 'function') {
        callback = maxLevel
        maxLevel = Infinity
      }

      if (parentNode.isBranch && parentNode.level < maxLevel) {
        parentNode.children.forEach(child => {
          // DFS + post-order traversal
          this.traverseDescendants(child, maxLevel, callback)
          callback(child)
        })
      }
    },

    traverseAncestors(childNode, callback) {
      const { parentNode } = childNode

      if (parentNode !== NO_PARENT_NODE) {
        // pre-order traversal
        callback(parentNode)
        this.traverseAncestors(parentNode, callback)
      }
    },

    traverseAllNodes(callback) {
      this.normalizedOptions.forEach(rootNode => {
        // post-order traversal
        this.traverseDescendants(rootNode, callback)
        callback(rootNode)
      })
    },

    toggleClickOutsideEvent(enabled) {
      if (enabled) {
        document.addEventListener('mousedown', this.handleClickOutside, false)
      } else {
        document.removeEventListener('mousedown', this.handleClickOutside, false)
      }
    },

    focusInput() {
      this.$refs.value.focusInput()
    },

    blurInput() {
      this.$refs.value.blurInput()
    },

    handleMouseDown: onlyOnLeftClick(function handleMouseDown(evt) {
      evt.preventDefault()
      evt.stopPropagation()

      if (this.disabled) return

      const isClickedOnValueWrapper = this.$refs.value.$el.contains(evt.target)

      if (isClickedOnValueWrapper) {
        if (this.isOpen && !this.searchable && !this._wasClickedOnValueItem) {
          this.closeMenu()
        } else if (!this.isOpen && (this.openOnClick || this.isFocused)) {
          this.openMenu()
        }
      }

      if (this._blurOnSelect) {
        this.blurInput()
      } else {
        // focus the input or prevent blurring
        this.focusInput()
      }

      this.resetFlags()
    }),

    handleMouseDownOnClear: onlyOnLeftClick(function handleMouseDownOnClear(evt) {
      evt.stopPropagation()
      evt.preventDefault()

      this.clear()
      this.focusInput()
    }),

    handleMouseDownOnArrow: onlyOnLeftClick(function handleMouseDownOnArrow(evt) {
      evt.preventDefault()
      evt.stopPropagation()

      // focus the input or prevent blurring
      this.focusInput()
      this.toggleMenu()
    }),

    handleClickOutside(evt) {
      /* istanbul ignore else */
      if (this.$refs.wrapper && !this.$refs.wrapper.contains(evt.target)) {
        this.blurInput()
        this.closeMenu()
      }
    },

    handleSearch() {
      if (this.searchQuery) {
        // enter search mode
        this.searching = true
        this.noSearchResults = true
        // reset state
        this.traverseAllNodes(node => {
          if (node.isBranch) {
            node.expandsOnSearch = false
            node.hasMatchedChild = false
            this.searchingCount[node.id] = {
              [ALL_CHILDREN]: 0,
              [ALL_DESCENDANTS]: 0,
              [LEAF_CHILDREN]: 0,
              [LEAF_DESCENDANTS]: 0,
            }
          }
        })
        this.traverseAllNodes(node => {
          const isMatched = node.isMatched = fuzzysearch(
            this.searchQuery.toLowerCase(),
            node.label.toLowerCase(),
          )
          if (isMatched) {
            this.noSearchResults = false
            node.ancestors.forEach(ancestor => this.searchingCount[ancestor.id].ALL_DESCENDANTS++)
            if (node.isLeaf) node.ancestors.forEach(ancestor => this.searchingCount[ancestor.id].LEAF_DESCENDANTS++)
            if (node.parentNode !== NO_PARENT_NODE) {
              this.searchingCount[node.parentNode.id].ALL_CHILDREN += 1
              if (node.isLeaf) this.searchingCount[node.parentNode.id].LEAF_CHILDREN += 1
            }
          }

          if (
            (isMatched || (node.isBranch && node.expandsOnSearch)) &&
            node.parentNode !== NO_PARENT_NODE
          ) {
            node.parentNode.expandsOnSearch = true
            node.parentNode.hasMatchedChild = true
          }
        })
      } else {
        this.searching = false
        // TODO: need resetting state?
      }
    },

    closeMenu() {
      if (!this.isOpen || (!this.disabled && this.alwaysOpen)) return
      this.isOpen = false
      /* istanbul ignore else */
      if (this.retainScrollPosition && this.$refs.menu) {
        this.lastScrollPosition = this.$refs.menu.scrollTop
      }
      this.toggleClickOutsideEvent(false)
      // reset search query after menu closes
      this.searchQuery = ''
      this.$emit('close', this.getValue(), this.id)
    },

    openMenu() {
      if (this.disabled || this.isOpen) return
      this.isOpen = true
      this.$nextTick(this.adjustPosition)
      /* istanbul ignore else */
      if (this.retainScrollPosition) this.$nextTick(this.restoreScrollPosition)
      if (!this.rootOptionsLoaded) this.loadOptions(true)
      this.toggleClickOutsideEvent(true)
      this.$emit('open', this.id)
    },

    toggleMenu() {
      if (this.isOpen) {
        this.closeMenu()
      } else {
        this.openMenu()
      }
    },

    toggleExpanded(node) {
      this.checkIfBranchNode(node)

      if (this.searching) {
        node.expandsOnSearch = !node.expandsOnSearch
      } else {
        node.isExpanded = !node.isExpanded
      }
    },

    initializeValue() {
      if (this.multiple) {
        this.internalValue = Array.isArray(this.value)
          ? this.value.slice()
          : []
        this.sortValue()
      } else {
        this.internalValue = this.value != null
          ? [ this.value ]
          : []
      }
    },

    initializeRootOptions(rootOptions) {
      this.normalizedOptions = this.normalize(NO_PARENT_NODE, rootOptions)
    },

    buildSelectedNodeMap() {
      const map = this.selectedNodeMap = Object.create(null)

      this.internalValue.forEach(selectedNodeId => {
        map[selectedNodeId] = true
      })
    },

    buildNodeCheckedStateMap() {
      const map = this.nodeCheckedStateMap = Object.create(null)
      if (!this.multiple) return

      this.selectedNodes.forEach(selectedNode => {
        map[selectedNode.id] = CHECKED

        if (!this.flat) {
          this.traverseDescendants(selectedNode, descendantNode => {
            map[descendantNode.id] = CHECKED
          })
          this.traverseAncestors(selectedNode, ancestorNode => {
            map[ancestorNode.id] = INDETERMINATE
          })
        }
      })

      this.normalizedOptions.forEach(rootNode => {
        if (!(rootNode.id in map)) {
          map[rootNode.id] = UNCHECKED
        }

        this.traverseDescendants(rootNode, descendantNode => {
          if (!(descendantNode.id in map)) {
            map[descendantNode.id] = UNCHECKED
          }
        })
      })
    },

    normalize(parentNode, nodes) {
      let normalizedOptions = nodes.map((node, index) => {
        this.checkDuplication(node)
        this.verifyNodeShape(node)

        const isRootNode = parentNode === NO_PARENT_NODE
        const { id, label, children, isDefaultExpanded } = node
        const isDisabled = !!node.isDisabled || (!this.flat && !isRootNode && parentNode.isDisabled)
        const isBranch = (
          Array.isArray(children) ||
          children === null ||
          (children === undefined && !!node.isBranch)
        )
        const isLeaf = !isBranch
        const level = isRootNode ? 0 : parentNode.level + 1
        const isMatched = false
        const ancestors = isRootNode ? [] : parentNode.ancestors.concat(parentNode)
        const _index = (isRootNode ? [] : parentNode.index).concat(index)
        const normalized = this.nodeMap[id] = {
          id,
          label,
          level,
          ancestors,
          index: _index,
          parentNode,
          isDisabled,
          isMatched,
          isLeaf,
          isBranch,
          isRootNode,
          raw: node,
        }

        if (isBranch) {
          const isLoaded = Array.isArray(children)
          if (!isLoaded) {
            warning(
              () => typeof this.loadChildrenOptions === 'function',
              () => 'Unloaded branch node detected. `loadChildrenOptions` prop is required to load its children.'
            )
          }

          normalized.isLoaded = isLoaded
          normalized.isPending = false
          normalized.isExpanded = typeof isDefaultExpanded === 'boolean'
            ? isDefaultExpanded
            : level < this.defaultExpandLevel
          normalized.hasMatchedChild = false
          normalized.hasDisabledDescendants = false
          normalized.expandsOnSearch = false
          normalized.loadingChildrenError = ''
          normalized.count = {
            [ALL_CHILDREN]: 0,
            [ALL_DESCENDANTS]: 0,
            [LEAF_CHILDREN]: 0,
            [LEAF_DESCENDANTS]: 0,
          }
          normalized.children = isLoaded
            ? this.normalize(normalized, children)
            : []

          if (normalized.isExpanded && !normalized.isLoaded) {
            this.loadOptions(false, normalized)
          }
        }

        normalized.ancestors.forEach(ancestor => ancestor.count.ALL_DESCENDANTS++)
        if (isLeaf) normalized.ancestors.forEach(ancestor => ancestor.count.LEAF_DESCENDANTS++)
        if (parentNode !== NO_PARENT_NODE) {
          parentNode.count.ALL_CHILDREN += 1
          if (isLeaf) parentNode.count.LEAF_CHILDREN += 1
        }

        if (isDisabled) {
          normalized.ancestors.forEach(ancestor => ancestor.hasDisabledDescendants = true)
        }

        return normalized
      })

      if (this.branchNodesFirst) {
        const branchNodes = normalizedOptions.filter(option => option.isBranch)
        const leafNodes = normalizedOptions.filter(option => option.isLeaf)
        normalizedOptions = branchNodes.concat(leafNodes)
      }

      return normalizedOptions
    },

    loadOptions(isRootLevel, parentNode) {
      if (isRootLevel) {
        if (this.loadingRootOptions) return

        const callback = (err, data) => {
          this.loadingRootOptions = false

          if (err) {
            this.loadingRootOptionsError = err.message || /* istanbul ignore next */ String(err)
          } else if (!data) {
            this.loadingRootOptionsError = 'no data received'
          } else if (!Array.isArray(data)) {
            this.loadingRootOptionsError = 'received unrecognizable data'
          } else {
            this.initialize(data)
            this.rootOptionsLoaded = true
          }
        }

        this.loadingRootOptions = true
        this.loadingRootOptionsError = ''
        this.loadRootOptions(callback)
      } else {
        if (parentNode.isPending) return

        const rawData = parentNode.raw
        const callback = (err, children) => {
          parentNode.isPending = false

          if (err) {
            parentNode.loadingChildrenError = this.loadChildrenErrorText(err)
          } else if (!Array.isArray(children)) {
            parentNode.loadingChildrenError = 'Received unrecognizable data'
            warning(
              () => false,
              () => `Received unrecognizable data ${children} while loading children options of node ${parentNode.id}`
            )
          } else {
            parentNode.children = this.normalize(parentNode, children)
            parentNode.isLoaded = true
            this.buildNodeCheckedStateMap()
          }
        }

        parentNode.isPending = true
        parentNode.loadingChildrenError = ''
        this.loadChildrenOptions(rawData, callback)
      }
    },

    checkDuplication(node) {
      warning(
        () => !hasOwn(this.nodeMap, node.id),
        () => `Detected duplicate presence of node id ${JSON.stringify(node.id)}. ` +
          `Their labels are "${this.nodeMap[node.id].label}" and "${node.label}" respectively.`
      )
    },

    verifyNodeShape(/* node */) {
      // TODO
    },

    select(node) {
      if (node.isDisabled) return

      if (this.single) {
        this.clear()
      }

      const toggleFlag = this.multiple && !this.flat
        ? this.nodeCheckedStateMap[node.id] === UNCHECKED
        : !this.isSelected(node)

      if (toggleFlag) {
        this._selectNode(node)
      } else {
        this._deselectNode(node)
      }

      this.buildSelectedNodeMap()
      this.buildNodeCheckedStateMap()

      if (this.searching && toggleFlag && (this.single || this.clearOnSelect)) {
        this.searchQuery = ''
      }

      if (this.single && this.closeOnSelect) {
        this.closeMenu()

        if (this.searchable) {
          this._blurOnSelect = true
        }
      }
    },

    clear() {
      if (this.hasValue) {
        this.internalValue = this.multiple
          ? this.internalValue.filter(nodeId => this.getNode(nodeId).isDisabled)
          : []
        this.buildSelectedNodeMap()
        this.buildNodeCheckedStateMap()
      }
    },

    _selectNode(node) {
      if (this.flat || this.disableBranchNodes) {
        this.addValue(node)
        return
      }

      if (this.multiple && node.isBranch && node.hasDisabledDescendants) {
        this.withoutDisabled(node.children).forEach(this._selectNode)
        return
      }

      this.addValue(node)

      if (this.multiple && !this.flat && !node.isRootNode) {
        let curr = node
        do {
          curr = curr.parentNode
          const siblings = curr.children
          if (siblings.every(this.isSelected)) {
            siblings.forEach(this.removeValue)
            this.addValue(curr)
          }
        } while (!curr.isRootNode)
      }
    },

    _deselectNode(node) {
      if (node.isBranch && node.hasDisabledDescendants) {
        if (this.isSelected(node)) {
          const disabledChildren = node.children.filter(child => child.isDisabled)
          if (node.children.length !== disabledChildren.length) {
            this.removeValue(node)
            disabledChildren.forEach(this.addValue)
          }
          return
        }
      }

      this.removeValue(node)

      if (this.multiple && !this.flat) {
        this.withoutDisabled(this.selectedNodes).forEach(selectedNode => {
          if (selectedNode.ancestors.indexOf(node) !== -1) {
            this.removeValue(selectedNode)
          }
        })

        if (!node.isRootNode) {
          const checkedAncestorNodeIndex = findIndex(node.ancestors, this.isSelected)

          if (checkedAncestorNodeIndex !== -1) {
            const checkedAncestorNode = node.ancestors[checkedAncestorNodeIndex]
            const nodesToBeExcluded = node.ancestors.concat(node)

            this.removeValue(checkedAncestorNode)
            this.traverseDescendants(
              checkedAncestorNode,
              node.level,
              descendantNode => {
                if (nodesToBeExcluded.indexOf(descendantNode) === -1) {
                  this.addValue(descendantNode)
                }
              }
            )
          }
        }
      }
    },

    addValue(node) {
      this.internalValue.push(node.id)
      this.selectedNodeMap[node.id] = true
      this.sortValue()
    },

    removeValue(node) {
      removeFromArray(this.internalValue, node.id)
      delete this.selectedNodeMap[node.id]
    },

    maybeRemoveLastValue() {
      /* istanbul ignore next */
      if (!this.hasValue) return
      const lastValue = last(this.internalValue)
      const lastSelectedNode = this.getNode(lastValue)
      this.removeValue(lastSelectedNode)
      this.buildSelectedNodeMap()
      this.buildNodeCheckedStateMap()
    },

    sortValue() {
      if (this.sortValueBy === LEVEL) {
        this.internalValue.sort((a, b) => sortValueByLevel(this.nodeMap[a], this.nodeMap[b]))
      } else if (this.sortValueBy === INDEX) {
        this.internalValue.sort((a, b) => sortValueByIndex(this.nodeMap[a], this.nodeMap[b]))
      }
    },

    restoreScrollPosition() {
      if (this.$refs.menu) this.$refs.menu.scrollTop = this.lastScrollPosition
    },

    adjustPosition() {
      // istanbul ignore next
      if (typeof window === 'undefined') return

      const rect = this.$el.getBoundingClientRect()
      const spaceAbove = rect.top
      const spaceBelow = window.innerHeight - rect.bottom
      const hasEnoughSpaceBelow = spaceBelow > this.maxHeight

      if (hasEnoughSpaceBelow || spaceBelow > spaceAbove || this.openDirection === 'below' || this.openDirection === 'bottom') {
        this.prefferedOpenDirection = 'below'
        this.optimizedHeight = Math.min(spaceBelow - 40, this.maxHeight)
      } else {
        this.prefferedOpenDirection = 'above'
        this.optimizedHeight = Math.min(spaceAbove - 40, this.maxHeight)
      }
    },
  },

  created() {
    this.verifyProps()
    this.resetFlags()
    this.initialize(this.options)
  },

  mounted() {
    if (this.autofocus) this.$refs.value.focusInput()
    if (!this.rootOptionsLoaded && this.autoLoadRootOptions) this.loadOptions(true)
    if (this.alwaysOpen) this.openMenu()
  },

  destroyed() {
    /* istanbul ignore next */
    this.toggleClickOutsideEvent(false)
  },
}
