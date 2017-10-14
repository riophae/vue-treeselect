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
     * Whether backspace removes an item if there is no text input
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
     * Whether to close the dropdown after selecting an option?
     * @type {boolean}
     */
    closeOnSelect: {
      // Defining an ALL type to avoid type casting, then we
      // will be able to know whether the prop value is specified and
      // determine default value based on value of `multiple` prop.
      // See computed property `shouldCloseOnSelect`.
      type: null,
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
     * Sets `maxHeight` style value of the dropdown
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
     * Array of available options
     * @type {!Object[]}
     */
    options: {
      type: Array,
      required: true,
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
    isOpen: false, // whether the dropdown is open
    nodeCheckedStateMap: Object.create(null), // used for multi-select mode
    nodeMap: Object.create(null), // map: nodeId -> node
    normalizedOptions: null, // normalized options tree
    noSearchResults: true, // whether there is any matching search results
    searchingCount: Object.create(null),
    searching: false,
    searchQuery: '',
    selectedNodeMap: Object.create(null),
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
     * Has any options has been selected?
     * @type {boolean}
     */
    hasValue() {
      return this.selectedNodesNumber > 0
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
      return this.clearable && !this.disabled && this.hasValue
    },

    /**
     * Should automatically close the dropdown after selecting an option?
     * @type {boolean}
     */
    shouldCloseOnSelect() {
      if (this.closeOnSelect == null && !this.multiple) {
        // defaults to true if single-select mode
        return true
      }
      return !!this.closeOnSelect
    },

    /**
     * Should show children count when searching?
     * @type {boolean}
     */
    showCountOnSearchComputed() {
      // Vue not allows set default prop value based on another prop value
      // so use computed property to workaround
      return typeof this.showCountOnSearch === 'boolean'
        ? this.showCountOnSearch
        : this.showCount
    },
    /* eslint-enable valid-jsdoc */
  },

  watch: {
    disabled(newValue) {
      // force close the dropdown after disabling the control
      if (newValue && this.isOpen) this.closeMenu()
    },

    isOpen(newValue) {
      this.toggleTouchOutsideEvent(newValue)
      // reset search query after dropdown closes
      if (!newValue) this.searchQuery = ''
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
      const _newValue = this.multiple
        ? newValue.slice()
        : newValue == null
          ? []
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
    getValue() {
      return this.multiple
        ? this.internalValue.slice()
        : this.internalValue[0]
    },

    getNode(nodeId) {
      warning(
        () => nodeId != null,
        () => `nodeId not valid: ${nodeId}`
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

    getRawNodeById(nodeId) {
      return this.nodeMap[nodeId].raw
    },

    getSelectedRawNodes() {
      const value = this.getValue()
      return this.multiple
        ? value.map(this.getRawNodeById)
        : this.getRawNodeById(value)
    },

    isSelected(node) {
      return node.id in this.selectedNodeMap
    },

    checkIfBranchNode(node) {
      warning(
        () => node && node.isBranch,
        () => `Should be of branch node: ${node}`
      )
    },

    traverseDescendants(parentNode, maxLevel, callback) {
      if (typeof maxLevel === 'function') {
        callback = maxLevel
        maxLevel = Infinity
      }

      if (parentNode.isBranch && parentNode.level < maxLevel) {
        parentNode.children.forEach(child => {
          // post-order traversal
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

    toggleTouchOutsideEvent(enabled) {
      if (enabled) {
        document.addEventListener('touchstart', this.handleTouchOutside, false)
      } else {
        document.removeEventListener('touchstart', this.handleTouchOutside, false)
      }
    },

    focusInput() {
      this.$refs.value.focusInput()
    },

    blurInput() {
      this.$refs.value.blurInput()
    },

    handleMouseDown: onlyOnLeftClick(function handleMouseDown(evt) {
      const isClickedOnValue = this.$refs.value.$el.contains(evt.target)

      evt.preventDefault()
      evt.stopPropagation()

      if (this.disabled) {
        return
      }

      if (!this.isFocused) {
        this.focusInput()
      } else if (!this.isOpen) {
        this.openMenu()
      } else if (!this.searchable && this.isOpen && isClickedOnValue) {
        this.closeMenu()
      }
    }),

    handleMouseDownOnClear: onlyOnLeftClick(function handleMouseDownOnClear(evt) {
      if (!this.isFocused) {
        // If the control isn't focused, stop propagation to
        // prevent the menu from being opened
        evt.stopPropagation()
      }

      this.clear()
    }),

    handleMouseDownOnArrow: onlyOnLeftClick(function handleMouseDownOnArrow(evt) {
      if (this.isOpen) {
        evt.stopPropagation()
        this.closeMenu()
      }
      // If the menu isn't open, let the event bubble to the main handleMouseDown
    }),

    handleTouchOutside(evt) {
      if (this.$refs.wrapper && !this.$refs.wrapper.contains(evt.target)) {
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
      if (!this.isOpen) return
      this.isOpen = false
      this.$emit('close', this.getValue(), this.id)
    },

    openMenu() {
      if (this.disabled || this.isOpen) return
      this.isOpen = true
      this.$emit('open', this.id)
    },

    toggleExpanded(node) {
      warning(
        () => node.isBranch,
        () => 'Expected a branch node.',
      )

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

    initializeOptions() {
      this.normalizedOptions = this.normalize(NO_PARENT_NODE, this.options)
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

    normalize(parentNode, options) {
      let normalizedOptions = options.map((node, index) => {
        this.checkDuplication(node)
        this.verifyNodeShape(node)

        const isRootNode = parentNode === NO_PARENT_NODE
        const { id, label, children } = node
        const { isDisabled = false } = node
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
          isDisabled, // TODO
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
          normalized.isExpanded = level < this.defaultExpandLevel
          normalized.hasMatchedChild = false
          normalized.expandsOnSearch = false
          normalized.error = ''
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
            this.loadChildren(normalized)
          }
        }

        normalized.ancestors.forEach(ancestor => ancestor.count.ALL_DESCENDANTS++)
        if (isLeaf) normalized.ancestors.forEach(ancestor => ancestor.count.LEAF_DESCENDANTS++)
        if (parentNode !== NO_PARENT_NODE) {
          parentNode.count.ALL_CHILDREN += 1
          if (isLeaf) parentNode.count.LEAF_CHILDREN += 1
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

    loadChildren(node) {
      const rawData = node.raw
      const callback = (err, children) => {
        node.isPending = false

        if (err) {
          node.error = this.loadChildrenErrorText(err)
        } else if (!Array.isArray(children)) {
          node.error = 'Received unrecognizable data'
          warning(
            () => false,
            () => `Received unrecognizable data ${children} while loading children options of node ${node.id}`
          )
        } else {
          node.children = this.normalize(node, children)
          node.isLoaded = true
          node.error = ''
          this.buildNodeCheckedStateMap()
        }
      }

      node.isPending = true
      this.loadChildrenOptions(rawData, callback)
    },

    checkDuplication(node) {
      warning(
        () => !hasOwn(this.nodeMap, node.id),
        () => `Detected duplicate nodes with same id: ${JSON.stringify(node.id)}. ` +
          `Their labels are ${JSON.stringify(this.nodeMap[node.id].label)} and ${JSON.stringify(node.label)}`
      )
    },

    verifyNodeShape(/* node */) {
      // TODO
    },

    select(node) {
      if (!this.multiple) {
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

      if (this.shouldCloseOnSelect) {
        this.closeMenu()
      }

      if (this.single) {
        this.blurInput()
      }
    },

    clear() {
      if (this.hasValue) {
        this.internalValue = []
        this.buildSelectedNodeMap()
        this.buildNodeCheckedStateMap()
      }
    },

    _selectNode(node) {
      this.addValue(node)

      if (this.multiple && !this.flat) {
        this.selectedNodes.forEach(selectedNode => {
          if (selectedNode.ancestors.indexOf(node) !== -1) {
            this.removeValue(selectedNode)
          }
        })

        if (!node.isRootNode) {
          const { parentNode } = node
          const siblings = parentNode.children

          if (siblings.every(this.isSelected)) {
            siblings.forEach(this.removeValue)
            this._selectNode(parentNode)
          }
        }
      }
    },

    _deselectNode(node) {
      this.removeValue(node)

      if (this.multiple && !this.flat) {
        this.selectedNodes.forEach(selectedNode => {
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
  },

  created() {
    this.initializeOptions()
    this.initializeValue()
    this.buildSelectedNodeMap()
    this.buildNodeCheckedStateMap()
  },

  mounted() {
    if (this.autofocus) this.$refs.value.focusInput()
  },

  destroyed() {
    this.toggleTouchOutsideEvent(false)
  },
}
