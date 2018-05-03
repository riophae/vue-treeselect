import fuzzysearch from 'fuzzysearch'

import {
  warning,
  quickDiff, onlyOnLeftClick,
  debounce, identity, constant, isPromise, once, createEmptyObjectWithoutPrototype,
  assign, last, find, removeFromArray,
} from '../utils'

import {
  UNCHECKED, INDETERMINATE, CHECKED,
  UNMATCHED, DESCENDANT_MATCHED, MATCHED,
  LOAD_ROOT_OPTIONS, LOAD_CHILDREN_OPTIONS, /* ASYNC_SEARCH, */
  NO_PARENT_NODE,
  ALL, BRANCH_PRIORITY, LEAF_PRIORITY, ALL_WITH_INDETERMINATE,
  ALL_CHILDREN, ALL_DESCENDANTS, LEAF_CHILDREN, LEAF_DESCENDANTS,
  ORDER_SELECTED, LEVEL, INDEX,
  INPUT_DEBOUNCE_DELAY, KEEP_REMAINING_HEIGHT,
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
     * Whether the menu should be always open
     */
    alwaysOpen: {
      type: Boolean,
      default: false,
    },

    /**
     * Deprecated. Use `autoFocus` instead.
     */
    autofocus: {
      type: Boolean,
      default: false,
    },

    /**
     * Automatically focus the component on mount?
     */
    autoFocus: {
      type: Boolean,
      default: false,
    },

    /**
     * Automatically load root options on mount. When set to `false`, root options will be loaded when the menu is opened.
     */
    autoLoadRootOptions: {
      type: Boolean,
      default: true,
    },

    /**
     * Whether pressing backspace key removes the last item if there is no text input
     */
    backspaceRemoves: {
      type: Boolean,
      default: true,
    },

    /**
     * Function that processes before clearing all input fields.
     * Return `false` to prevent value from being cleared.
     * @type {function(): (boolean|Promise<boolean>)}
     */
    beforeClearAll: {
      type: Function,
      default: constant(true),
    },

    /**
     * Show branch nodes before leaf nodes?
     */
    branchNodesFirst: {
      type: Boolean,
      default: false,
    },

    /**
     * Show an "×" icon that resets value?
     */
    clearable: {
      type: Boolean,
      default: true,
    },

    /**
     * Title for the "×" icon when multiple: true
     */
    clearAllText: {
      type: String,
      default: 'Clear all',
    },

    /**
     * Whether to clear the search input after selecting.
     * Use only when `multiple` is `true`.
     * For single-select mode, it **always** clears the input after selecting an option regardless of the prop value.
     */
    clearOnSelect: {
      type: Boolean,
      default: false,
    },

    /**
     * Title for the "×" icon
     */
    clearValueText: {
      type: String,
      default: 'Clear value',
    },

    /**
     * Whether to close the menu after selecting an option?
     * Use only when `multiple` is `true`.
     */
    closeOnSelect: {
      type: Boolean,
      default: true,
    },

    /**
     * How many levels of branch nodes should be automatically expanded when loaded.
     * Set `Infinity` to make all branch nodes expanded by default.
     */
    defaultExpandLevel: {
      type: Number,
      default: 0,
    },

    /**
     * Whether pressing delete key removes the last item if there is no text input
     */
    deleteRemoves: {
      type: Boolean,
      default: true,
    },

    /**
     * Delimiter to use to join multiple values for the hidden field value
     */
    delimiter: {
      type: String,
      default: ',',
    },

    /**
     * Prevent branch nodes from being selected?
     */
    disableBranchNodes: {
      type: Boolean,
      default: false,
    },

    /**
     * Disable the control?
     */
    disabled: {
      type: Boolean,
      default: false,
    },

    /**
     * Disable the fuzzy matching functionality?
     */
    disableFuzzyMatching: {
      type: Boolean,
      default: false,
    },

    /**
     * Search in ancestor nodes too.
     */
    searchNested: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether escape clears the value when the menu is closed
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
     */
    flat: {
      type: Boolean,
      default: false,
    },

    /**
     * Will be passed with all events as second param.
     * Useful for identifying events origin.
     * @type {string|number}
    */
    id: {
      default: null,
    },

    /**
     * Joins multiple values into a single form field with the delimiter (legacy mode)
    */
    joinValues: {
      type: Boolean,
      default: false,
    },

    /**
     * Limit the display of selected options.
     * The rest will be hidden within the limitText string.
     */
    limit: {
      type: Number,
      default: Infinity,
    },

    /**
     * Function that processes the message shown when selected elements pass the defined limit
     * @type {function(number): string}
     */
    limitText: {
      type: Function,
      default: limitTextDefault,
    },

    /**
     * Whether is externally loading options or not.
     * Set `true` to show a spinner.
     */
    loading: {
      type: Boolean,
      default: false,
    },

    /**
     * Text displayed when a branch node is loading its children options
     */
    loadingText: {
      type: String,
      default: 'Loading...',
    },

    /**
     * Used for dynamically loading options.
     * @type {function({action: string, callback: (function((Error|string)=): void), parentNode: node=, id}): void}
     */
    loadOptions: {
      type: Function,
    },

    /**
     * Sets `maxHeight` style value of the menu
     */
    maxHeight: {
      type: Number,
      default: 300,
    },

    /**
     * Set `true` to allow selecting multiple options (a.k.a., multi-select mode)
     */
    multiple: {
      type: Boolean,
      default: false,
    },

    /**
     * Generates a hidden <input /> tag with this field name for html forms
     */
    name: {
      type: String,
    },

    /**
     * Text displayed when a branch node has no children options
     */
    noChildrenText: {
      type: String,
      default: 'No sub-options.',
    },

    /**
     * Text displayed when there are no available options
     */
    noOptionsText: {
      type: String,
      default: 'No options available.',
    },

    /**
     * Text displayed when there are no matching search results
     */
    noResultsText: {
      type: String,
      default: 'No results found...',
    },

    /**
     * Used for normalizing source data
     * @type {function(node): node}
     */
    normalizer: {
      type: Function,
      default: identity,
    },

    /**
     * Fixed opening direction
     */
    openDirection: {
      type: String,
      default: 'auto',
    },

    /**
     * Whether to automatically open the menu when the control is clicked
     */
    openOnClick: {
      type: Boolean,
      default: true,
    },

    /**
     * Whether to automatically open the menu when the control is focused
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
     */
    placeholder: {
      type: String,
      default: 'Select...',
    },

    /**
     * Applies HTML5 required attribute when needed
     */
    required: {
      type: Boolean,
      default: false,
    },

    /**
     * Whether to retain the scroll position on menu reopen
     */
    retainScrollPosition: {
      type: Boolean,
      default: true,
    },

    /**
     * Text displayed asking user whether to retry loading children options
     */
    retryText: {
      type: String,
      default: 'Retry?',
    },

    /**
     * Title for the retry button
     */
    retryTitle: {
      type: String,
      default: 'Click to retry',
    },

    /**
     * Enable searching feature?
     */
    searchable: {
      type: Boolean,
      default: true,
    },

    /**
     * Whether to show a children count next to the label of each branch node
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
     */
    showCountOf: {
      type: String,
      default: ALL_CHILDREN,
      validator(value) {
        const acceptableValues = [ ALL_CHILDREN, ALL_DESCENDANTS, LEAF_CHILDREN, LEAF_DESCENDANTS ]
        return acceptableValues.indexOf(value) !== -1
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
     */
    sortValueBy: {
      type: String,
      default: ORDER_SELECTED,
      validator(value) {
        const acceptableValues = [ ORDER_SELECTED, LEVEL, INDEX ]
        return acceptableValues.indexOf(value) !== -1
      },
    },

    /**
     * Tab index of the control
     */
    tabIndex: {
      type: Number,
      default: 0,
    },

    /**
     * An array of node ids or node objects as the initial field value.
     * The format depends on the ${v('valueFormat')} prop.
     * @type {?Array}
     */
    value: null,

    /**
     * Which kind of nodes should be included in the value array in multi-select mode
     * Acceptable values:
     *   - "ALL" - Any node that is checked will be included in the `value` array
     *   - "BRANCH_PRIORITY" (default) - If a branch node is checked, all its descendants will be excluded in the `value` array
     *   - "LEAF_PRIORITY" - If a branch node is checked, this node itself and its branch descendants will be excluded from the `value` array but its leaf descendants will be included
     *   - "ALL_WITH_INDETERMINATE" - Any node that is checked will be included in the `value` array, plus indeterminate nodes
     */
    valueConsistsOf: {
      type: String,
      default: BRANCH_PRIORITY,
      validator(value) {
        const acceptableValues = [ ALL, BRANCH_PRIORITY, LEAF_PRIORITY, ALL_WITH_INDETERMINATE ]
        return acceptableValues.indexOf(value) !== -1
      },
    },

    /**
     * Format of `value` prop
     * Acceptable values:
     *   - "id"
     *   - "object"
     */
    valueFormat: {
      type: String,
      default: 'id',
    },
  },

  data() {
    return {
      normalizedOptions: null, // normalized options tree
      selectedNodeIds: this.extractCheckedNodeIdsFromValue(),
      nodeCheckedStateMap: createEmptyObjectWithoutPrototype(), // used for multi-select mode
      nodeMap: createEmptyObjectWithoutPrototype(), // map: nodeId -> node
      selectedNodeMap: createEmptyObjectWithoutPrototype(),
      isFocused: false, // whether the control has been focused
      isOpen: false, // whether the menu is open
      rootOptionsLoaded: false,
      loadingRootOptions: false,
      loadingRootOptionsError: '',
      noSearchResults: true, // whether there is any matching search result
      searchingCount: createEmptyObjectWithoutPrototype(),
      searching: false,
      searchQuery: '',
      lastScrollPosition: 0,
      optimizedHeight: 0,
      prefferedOpenDirection: 'below',
    }
  },

  computed: {
    /* eslint-disable valid-jsdoc */
    /**
     * Normalized options that has been selected
     * @type {Object[]}
     */
    selectedNodes() {
      return this.selectedNodeIds.map(this.getNode)
    },
    /**
     * Id list of selected nodes with `sortValueBy` prop applied
     * @type {nodeId[]}
     */
    internalValue() {
      let internalValue

      // istanbul ignore else
      if (this.single || this.flat || this.valueConsistsOf === ALL) {
        internalValue = this.selectedNodeIds.slice()
      } else if (this.valueConsistsOf === BRANCH_PRIORITY) {
        internalValue = this.selectedNodeIds.filter(id => {
          const node = this.getNode(id)
          if (node.isRootNode) return true
          return !this.isSelected(node.parentNode)
        })
      } else if (this.valueConsistsOf === LEAF_PRIORITY) {
        internalValue = this.selectedNodeIds.filter(id => {
          const node = this.getNode(id)
          if (node.isLeaf) return true
          return node.children.length === 0
        })
      } else if (this.valueConsistsOf === ALL_WITH_INDETERMINATE) {
        internalValue = Object.keys(this.nodeCheckedStateMap).filter(id => {
          const checkedState = this.nodeCheckedStateMap[id]
          return checkedState === CHECKED || checkedState === INDETERMINATE
        })
      }

      if (this.sortValueBy === LEVEL) {
        internalValue.sort((a, b) => sortValueByLevel(this.getNode(a), this.getNode(b)))
      } else if (this.sortValueBy === INDEX) {
        internalValue.sort((a, b) => sortValueByIndex(this.getNode(a), this.getNode(b)))
      }

      return internalValue
    },
    /**
     * Has any option been selected?
     * @type {boolean}
     */
    hasValue() {
      return this.internalValue.length > 0
    },
    /**
     * Has any undisabled option been selected?
     * @type {boolean}
     */
    hasUndisabledValue() {
      return this.hasValue && this.internalValue.map(this.getNode).some(node => !node.isDisabled)
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
      return this.internalValue.map(this.getNode).slice(0, this.limit)
    },
    /**
     * Whether has passed the defined limit or not
     * @type {boolean}
     */
    hasExceededLimit() {
      return this.internalValue.length > this.limit
    },
    /**
     * Should the "×" icon be shown?
     * @type {boolean}
     */
    shouldShowX() {
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
    hasBranchNodes() {
      return this.normalizedOptions.some(rootNode => rootNode.isBranch)
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

    internalValue() {
      this.$emit('input', this.getValue(), this.id)
    },

    multiple(newValue) {
      // istanbul ignore else
      if (newValue) {
        // needs to rebuild the state tree when switching from
        // single-select mode to multi-select mode
        this.buildNodeCheckedStateMap()
      }
    },

    searchQuery: debounce(function onSearchQueryChange() {
      this.handleSearch()
      this.$emit('search-change', this.searchQuery, this.id)
    }, INPUT_DEBOUNCE_DELAY),

    value() {
      const newInternalValue = this.extractCheckedNodeIdsFromValue()
      const hasChanged = quickDiff(newInternalValue, this.internalValue)

      if (hasChanged) {
        this.selectedNodeIds = newInternalValue
        this.completeSelectedNodeIdList()
        this.buildSelectedNodeMap()
        this.buildNodeCheckedStateMap()
      }
    },
  },

  methods: {
    verifyProps() {
      warning(
        () => this.autofocus === false,
        () => '`autofocus` prop is deprecated. Use `autoFocus` instead.'
      )

      if (this.options == null && !this.loadOptions) {
        warning(
          () => false,
          () => 'Are you meant to dynamically load options? You need to use `loadOptions` prop.'
        )
      }
    },

    resetFlags() {
      this._blurOnSelect = false
      this._wasClickedOnValueItem = false
    },

    initialize(rootOptions) {
      if (Array.isArray(rootOptions)) {
        // in case we are reinitializing options,
        // keep the old state tree temporarily.
        const prevNodeMap = this.nodeMap
        this.nodeMap = createEmptyObjectWithoutPrototype()
        this.keepDataOfSelectedNodes(prevNodeMap)
        this.normalizedOptions = this.normalize(NO_PARENT_NODE, rootOptions, prevNodeMap)
        this.completeSelectedNodeIdList()
        this.buildSelectedNodeMap()
        this.buildNodeCheckedStateMap()
        this.rootOptionsLoaded = true
      } else {
        this.normalizedOptions = []
      }
    },

    getValue() {
      if (this.valueFormat === 'id') {
        return this.multiple
          ? this.internalValue.slice()
          : this.internalValue[0]
      }

      const rawNodes = this.internalValue.map(id => this.getNode(id).raw)
      return this.multiple ? rawNodes : rawNodes[0]
    },

    getNode(nodeId) {
      warning(
        () => nodeId != null,
        () => `Invalid node id: ${nodeId}`
      )

      if (nodeId == null) return null

      return nodeId in this.nodeMap
        ? this.nodeMap[nodeId]
        : this.createFallbackNode(nodeId)
    },

    createFallbackNode(id) {
      // in case there is a default selected node that is not loaded into the tree yet
      // we create a fallback node to keep the component working
      // when the real data is loaded, we'll override this fake node

      const raw = this.extractNodeFromValue(id)
      const label = this.enhancedNormalizer(raw).label || `${id} (unknown)`
      const fallbackNode = {
        id,
        label,
        ancestors: [],
        parentNode: NO_PARENT_NODE,
        isFallbackNode: true,
        isRootNode: true,
        isLeaf: true,
        isBranch: false,
        isDisabled: false,
        index: [ -1 ],
        level: 0,
        raw,
      }

      this.$set(this.nodeMap, id, fallbackNode)
      return fallbackNode
    },

    extractCheckedNodeIdsFromValue() {
      if (this.value == null) return []

      if (this.valueFormat === 'id') {
        return this.multiple
          ? this.value.slice()
          : [ this.value ]
      }

      return (this.multiple ? this.value : [ this.value ])
        .map(node => this.enhancedNormalizer(node))
        .map(node => node.id)
    },

    extractNodeFromValue(id) {
      const defaultNode = { id }

      if (this.valueFormat === 'id') {
        return defaultNode
      }

      const valueArray = this.multiple
        ? Array.isArray(this.value) ? this.value : []
        : this.value ? [ this.value ] : []
      const matched = find(
        valueArray,
        node => node && this.enhancedNormalizer(node).id === id
      )

      return matched || defaultNode
    },

    completeSelectedNodeIdList() {
      const nodeIds = this.selectedNodeIds.slice()
      this.selectedNodeIds = []
      this.nodeCheckedStateMap = createEmptyObjectWithoutPrototype()
      this.selectedNodeMap = createEmptyObjectWithoutPrototype()
      nodeIds.forEach(id => {
        if (this.selectedNodeIds.indexOf(id) === -1) {
          this._selectNode(this.getNode(id), { ignoreDisabled: true })
        }
      })
    },

    keepDataOfSelectedNodes(prevNodeMap) {
      // in case there is any selected node that is not present in the new `options` array
      // which could be useful for async search mode
      this.selectedNodeIds.forEach(id => {
        if (!prevNodeMap[id]) return
        const fallbackNode = assign({}, prevNodeMap[id], {
          isFallbackNode: true,
        })
        this.$set(this.nodeMap, id, fallbackNode)
      })
    },

    isSelected(node) {
      // whether a node is selected (single-select mode) or fully-checked (multi-select mode)
      return this.selectedNodeMap[node.id] === true
    },

    checkIfBranchNode(node) {
      warning(
        () => node && node.isBranch,
        // istanbul ignore next
        () => `Expected a branch node, instead got: ${node}`
      )
    },

    stringifyValue(value) {
      return typeof value === 'string'
        ? value
        : (value !== null && JSON.stringify(value)) || ''
    },

    traverseDescendantsBFS(parentNode, callback) {
      // istanbul ignore if
      if (!parentNode.isBranch) return
      const queue = parentNode.children.slice()
      while (queue.length) {
        const currNode = queue[0]
        if (currNode.isBranch) queue.push(...currNode.children)
        callback(currNode)
        queue.shift()
      }
    },

    traverseDescendantsDFS(parentNode, callback) {
      if (!parentNode.isBranch) return
      parentNode.children.forEach(child => {
        // post-order traversal
        this.traverseDescendantsDFS(child, callback)
        callback(child)
      })
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
        this.traverseDescendantsDFS(rootNode, callback)
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
      // We don't use async/await here because we don't want
      // to rely on Babel polyfill or regenerator runtime.
      // See: https://babeljs.io/docs/plugins/transform-regenerator/
      // We also don't want to assume there is a global `Promise` class,
      // since we are targeting to support IE9 without the need of any polyfill.

      evt.stopPropagation()
      evt.preventDefault()

      const result = this.beforeClearAll()
      const handler = shouldClear => {
        if (shouldClear) {
          this.clear()
        }

        this.focusInput()
      }

      if (isPromise(result)) {
        // the handler will be called async
        result.then(handler)
      } else {
        // keep the same behavior here
        setTimeout(() => handler(result), 0)
      }
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
            this.$set(this.searchingCount, node.id, {
              [ALL_CHILDREN]: 0,
              [ALL_DESCENDANTS]: 0,
              [LEAF_CHILDREN]: 0,
              [LEAF_DESCENDANTS]: 0,
            })
          }
        })
        const lowerCasedSearchQuery = this.searchQuery.trim().toLocaleLowerCase()
        const splitSearchQuery = lowerCasedSearchQuery.replace(/\s+/g, ' ').split(' ')
        this.traverseAllNodes(node => {
          let isMatched
          if (this.searchNested && splitSearchQuery.length > 1) {
            isMatched = node.isMatched = splitSearchQuery.every(
              filterValue => node.nestedSearchLabel.indexOf(filterValue) !== -1,
            )
          } else {
            isMatched = node.isMatched = this.disableFuzzyMatching
              ? node.lowerCasedLabel.indexOf(lowerCasedSearchQuery) !== -1
              : fuzzysearch(lowerCasedSearchQuery, node.lowerCasedLabel)
          }
          if (isMatched) {
            this.noSearchResults = false
            node.ancestors.forEach(ancestor => this.searchingCount[ancestor.id].ALL_DESCENDANTS++)
            if (node.isLeaf) node.ancestors.forEach(ancestor => this.searchingCount[ancestor.id].LEAF_DESCENDANTS++)
            if (node.parentNode !== NO_PARENT_NODE) {
              this.searchingCount[node.parentNode.id].ALL_CHILDREN += 1
              // istanbul ignore else
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
      }
    },

    closeMenu() {
      if (!this.isOpen || (!this.disabled && this.alwaysOpen)) return
      /* istanbul ignore else */
      if (this.retainScrollPosition) this.saveScrollPosition()
      this.isOpen = false
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
      if (!this.rootOptionsLoaded) this.loadRootOptions()
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

    buildSelectedNodeMap() {
      const map = createEmptyObjectWithoutPrototype()

      this.selectedNodeIds.forEach(selectedNodeId => {
        map[selectedNodeId] = true
      })

      this.selectedNodeMap = map
    },

    buildNodeCheckedStateMap() {
      const map = createEmptyObjectWithoutPrototype()

      if (this.multiple) {
        this.selectedNodes.forEach(selectedNode => {
          map[selectedNode.id] = CHECKED

          if (!this.flat) {
            this.traverseAncestors(selectedNode, ancestorNode => {
              if (!this.isSelected(ancestorNode)) {
                map[ancestorNode.id] = INDETERMINATE
              }
            })
          }
        })

        this.traverseAllNodes(node => {
          if (!(node.id in map)) {
            map[node.id] = UNCHECKED
          }
        })
      }

      this.nodeCheckedStateMap = map
    },

    enhancedNormalizer(raw) {
      return assign({}, raw, this.normalizer(raw, this.id))
    },

    normalize(parentNode, nodes, prevNodeMap) {
      let normalizedOptions = nodes
        .map(node => [ this.enhancedNormalizer(node), node ])
        .map(([ node, raw ], index) => {
          this.checkDuplication(node)
          this.verifyNodeShape(node)

          const { id, label, children, isDefaultExpanded } = node
          const isRootNode = parentNode === NO_PARENT_NODE
          const level = isRootNode ? 0 : parentNode.level + 1
          const isBranch = Array.isArray(children) || children === null
          const isLeaf = !isBranch
          const isDisabled = !!node.isDisabled || (!this.flat && !isRootNode && parentNode.isDisabled)
          const lowerCasedLabel = label.toLocaleLowerCase()
          const nestedSearchLabel = isRootNode
            ? lowerCasedLabel
            : parentNode.nestedSearchLabel + ' ' + lowerCasedLabel

          const normalized = this.$set(this.nodeMap, id, createEmptyObjectWithoutPrototype())
          this.$set(normalized, 'id', id)
          this.$set(normalized, 'label', label)
          this.$set(normalized, 'level', level)
          this.$set(normalized, 'ancestors', isRootNode ? [] : parentNode.ancestors.concat(parentNode))
          this.$set(normalized, 'index', (isRootNode ? [] : parentNode.index).concat(index))
          this.$set(normalized, 'parentNode', parentNode)
          this.$set(normalized, 'lowerCasedLabel', lowerCasedLabel)
          this.$set(normalized, 'nestedSearchLabel', nestedSearchLabel)
          this.$set(normalized, 'isDisabled', isDisabled)
          this.$set(normalized, 'isMatched', false)
          this.$set(normalized, 'isBranch', isBranch)
          this.$set(normalized, 'isLeaf', isLeaf)
          this.$set(normalized, 'isRootNode', isRootNode)
          this.$set(normalized, 'raw', raw)

          if (isBranch) {
            const isLoaded = Array.isArray(children)

            this.$set(normalized, 'isLoaded', isLoaded)
            this.$set(normalized, 'isPending', false)
            this.$set(normalized, 'isExpanded', typeof isDefaultExpanded === 'boolean'
              ? isDefaultExpanded
              : level < this.defaultExpandLevel)
            this.$set(normalized, 'hasMatchedChild', false)
            this.$set(normalized, 'hasDisabledDescendants', false)
            this.$set(normalized, 'expandsOnSearch', false)
            this.$set(normalized, 'loadingChildrenError', '')
            this.$set(normalized, 'count', {
              [ALL_CHILDREN]: 0,
              [ALL_DESCENDANTS]: 0,
              [LEAF_CHILDREN]: 0,
              [LEAF_DESCENDANTS]: 0,
            })
            this.$set(normalized, 'children', isLoaded
              ? this.normalize(normalized, children, prevNodeMap)
              : [])

            if (!isLoaded && typeof this.loadOptions !== 'function') {
              warning(
                () => false,
                () => 'Unloaded branch node detected. `loadOptions` prop is required to load its children.'
              )
            } else if (!isLoaded && normalized.isExpanded) {
              this.loadChildrenOptions(normalized)
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

          if (prevNodeMap && prevNodeMap[id]) {
            const prev = prevNodeMap[id]
            if (prev.isBranch && normalized.isBranch) {
              normalized.isExpanded = prev.isExpanded
              normalized.expandsOnSearch = prev.expandsOnSearch
              normalized.isPending = prev.isPending
              normalized.loadingChildrenError = prev.loadingChildrenError
            }
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

    loadRootOptions() {
      this.callLoadOptionsProp({
        action: LOAD_ROOT_OPTIONS,
        isPending: () => {
          return this.loadingRootOptions
        },
        start: () => {
          this.loadingRootOptions = true
          this.loadingRootOptionsError = ''
        },
        succeed: () => {
          this.rootOptionsLoaded = true
        },
        fail: err => {
          this.loadingRootOptionsError = err.message || String(err)
        },
        end: () => {
          this.loadingRootOptions = false
        },
      })
    },

    loadChildrenOptions(parentNode) {
      const { id, raw } = parentNode
      // the options may be reinitialized anytime during the loading process
      // so `parentNode` can be expired and we use `getNode()` to avoid that

      this.callLoadOptionsProp({
        action: LOAD_CHILDREN_OPTIONS,
        args: {
          parentNode: raw,
        },
        isPending: () => {
          return this.getNode(id).isPending
        },
        start: () => {
          this.getNode(id).isPending = true
          this.getNode(id).loadingChildrenError = ''
        },
        succeed: () => {
          this.getNode(id).isLoaded = true
        },
        fail: err => {
          this.getNode(id).loadingChildrenError = err.message || String(err)
        },
        end: () => {
          this.getNode(id).isPending = false
        },
      })
    },

    callLoadOptionsProp({ action, args, isPending, start, succeed, fail, end }) {
      if (!this.loadOptions || isPending()) {
        return
      }

      const callback = once(err => {
        if (err) {
          fail(err)
        } else {
          succeed()
        }

        end()
      })

      start()
      const result = this.loadOptions({ id: this.id, action, ...args, callback })

      if (isPromise(result)) {
        result.then(() => {
          callback()
        }, err => {
          callback(err)
        })
      }
    },

    checkDuplication(node) {
      warning(
        () => !((node.id in this.nodeMap) && !this.nodeMap[node.id].isFallbackNode),
        () => `Detected duplicate presence of node id ${JSON.stringify(node.id)}. ` +
          `Their labels are "${this.nodeMap[node.id].label}" and "${node.label}" respectively.`
      )
    },

    verifyNodeShape(node) {
      warning(
        () => !(node.children === undefined && node.isBranch === true),
        () => 'Are you meant to declares an unloaded branch node? ' +
          '`isBranch: true` is no longer supported, please use `children: null` instead.'
      )
    },

    select(node) {
      if (node.isDisabled) {
        return
      }

      if (this.single) {
        this.clear()
      }

      const state = this.multiple && !this.flat
        ? this.nodeCheckedStateMap[node.id] === UNCHECKED
        : !this.isSelected(node)

      if (state) {
        this._selectNode(node)
      } else {
        this._deselectNode(node)
      }

      this.buildSelectedNodeMap()
      this.buildNodeCheckedStateMap()

      if (state) {
        this.$emit('select', node.raw, this.id)
      } else {
        this.$emit('deselect', node.raw, this.id)
      }

      if (this.searching && state && (this.single || this.clearOnSelect)) {
        this.searchQuery = ''
      }

      if (this.single && this.closeOnSelect) {
        this.closeMenu()

        // istanbul ignore else
        if (this.searchable) {
          this._blurOnSelect = true
        }
      }
    },

    clear() {
      if (this.hasValue) {
        this.selectedNodeIds = this.multiple
          ? this.selectedNodeIds.filter(nodeId => this.getNode(nodeId).isDisabled)
          : []
        this.buildSelectedNodeMap()
        this.buildNodeCheckedStateMap()
      }
    },

    _selectNode(node, { ignoreDisabled = false } = {}) {
      if (this.single || this.flat || this.disableBranchNodes) {
        this.addValue(node)
        return
      }

      if (node.isLeaf || (node.isBranch && (!node.hasDisabledDescendants || ignoreDisabled))) {
        this.addValue(node)
      }

      if (node.isBranch) {
        this.traverseDescendantsBFS(node, descendant => {
          if (!descendant.isDisabled || ignoreDisabled) this.addValue(descendant)
        })
      }

      if (node.isLeaf || (node.isBranch && (!node.hasDisabledDescendants || ignoreDisabled))) {
        let curr = node
        while (!curr.isRootNode) {
          curr = curr.parentNode
          const siblings = curr.children
          if (siblings.every(this.isSelected)) {
            this.addValue(curr)
          } else {
            break
          }
        }
      }
    },

    _deselectNode(node) {
      if (this.single || this.flat || this.disableBranchNodes) {
        this.removeValue(node)
        return
      }

      let hasUncheckedSomeDescendants = false
      if (node.isBranch) {
        this.traverseDescendantsDFS(node, descendant => {
          if (!descendant.isDisabled) {
            this.removeValue(descendant)
            hasUncheckedSomeDescendants = true
          }
        })
      }

      switch (true) {
      case node.isLeaf:
      case /* node.isBranch && */hasUncheckedSomeDescendants:
      case /* node.isBranch && */node.children.length === 0: {
        this.removeValue(node)

        let curr = node
        while (!curr.isRootNode) {
          curr = curr.parentNode
          if (this.isSelected(curr)) {
            this.removeValue(curr)
          } else {
            break
          }
        }
        break
      }

      default:
      }
    },

    addValue(node) {
      this.selectedNodeIds.push(node.id)
      this.selectedNodeMap[node.id] = true
    },

    removeValue(node) {
      removeFromArray(this.selectedNodeIds, node.id)
      delete this.selectedNodeMap[node.id]
    },

    maybeRemoveLastValue() {
      // istanbul ignore next
      if (!this.hasValue) return
      const lastValue = last(this.selectedNodeIds)
      const lastSelectedNode = this.getNode(lastValue)
      this.removeValue(lastSelectedNode)
      this.buildSelectedNodeMap()
      this.buildNodeCheckedStateMap()
    },

    saveScrollPosition() {
      if (this.$refs.menu) this.lastScrollPosition = this.$refs.menu.scrollTop
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
      const isInViewport = rect.top > 0 && (window.innerHeight - rect.top) > KEEP_REMAINING_HEIGHT

      switch (true) {
      case hasEnoughSpaceBelow:
      case spaceBelow > spaceAbove:
      case !isInViewport:
      case this.openDirection === 'below':
      case this.openDirection === 'bottom':
        this.prefferedOpenDirection = 'below'
        this.optimizedHeight = Math.max(Math.min(spaceBelow - KEEP_REMAINING_HEIGHT, this.maxHeight), this.maxHeight)
        break

      default:
        this.prefferedOpenDirection = 'above'
        this.optimizedHeight = Math.min(spaceAbove - KEEP_REMAINING_HEIGHT, this.maxHeight)
      }
    },
  },

  created() {
    this.verifyProps()
    this.resetFlags()
    this.initialize(this.options)
    this.$watch('options', () => this.initialize(this.options), { deep: true })
  },

  mounted() {
    if (this.autoFocus || this.autofocus) this.$refs.value.focusInput()
    if (!this.rootOptionsLoaded && this.autoLoadRootOptions) this.loadRootOptions()
    if (this.alwaysOpen) this.openMenu()
  },

  destroyed() {
    // istanbul ignore next
    this.toggleClickOutsideEvent(false)
  },
}
