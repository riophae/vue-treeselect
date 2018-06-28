import fuzzysearch from 'fuzzysearch'
import debounce from 'lodash/debounce'

import {
  warning,
  onlyOnLeftClick, scrollIntoView,
  isNaN, isPromise, once,
  identity, constant, createMap,
  quickDiff, getLast, includes, find, removeFromArray,
} from '../utils'

import {
  UNCHECKED, INDETERMINATE, CHECKED,
  LOAD_ROOT_OPTIONS, LOAD_CHILDREN_OPTIONS, /* ASYNC_SEARCH, */
  NO_PARENT_NODE,
  ALL, BRANCH_PRIORITY, LEAF_PRIORITY, ALL_WITH_INDETERMINATE,
  ALL_CHILDREN, ALL_DESCENDANTS, LEAF_CHILDREN, LEAF_DESCENDANTS,
  ORDER_SELECTED, LEVEL, INDEX,
  INPUT_DEBOUNCE_DELAY, MENU_BUFFER,
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

function createAsyncOptionsStates() {
  return {
    isLoaded: false,
    isLoading: false,
    loadingError: '',
  }
}

function stringifyOptionPropValue(value) {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && !isNaN(value)) return value + ''
  // istanbul ignore next
  return ''
}

function match(enableFuzzyMatch, needle, haystack) {
  return enableFuzzyMatch
    ? fuzzysearch(needle, haystack)
    : includes(haystack, needle)
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
     * Show an "×" button that resets value?
     */
    clearable: {
      type: Boolean,
      default: true,
    },

    /**
     * Title for the "×" button when multiple: true
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
     * Title for the "×" button
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
     * Deprecated. Use `instanceId` prop instead.
     * @type {string|number}
    */
    id: {
      default: null,
    },

    /**
     * Will be passed with all events as second param.
     * Useful for identifying events origin.
     * @type {string|number}
    */
    instanceId: {
      default: null,
    },

    /**
     * Joins multiple values into a single form field with the `delimiter` (legacy mode)
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
      default: function limitTextDefault(count) { // eslint-disable-line func-name-matching
        return `and ${count} more`
      },
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
     * @type {function({action: string, callback: (function((Error|string)=): void), parentNode: node=, instanceId}): void}
     */
    loadOptions: {
      type: Function,
    },

    /**
     * Which node properties to filter on
     */
    matchKeys: {
      type: Array,
      default: constant([ 'label' ]),
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
     * @type {function(node, instanceId): node}
     */
    normalizer: {
      type: Function,
      default: identity,
    },

    /**
     * By default the menu will open whereever there is more space once there is not enough space below to open at `maxHeight`.
     * Use this prop to force the menu to always open to specified direction.
     * Acceptable values:
     *   - `"auto"`
     *   - `"below"`
     *   - `"bottom"`
     *   - `"above"`
     *   - `"top"`
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
     * Used in conjunction with `showCount` to specify which type of count number should be displayed.
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
        return includes(acceptableValues, value)
      },
    },

    /**
     * Whether to show children count when searching.
     * Fallbacks to the value of `showCount` when not specified.
     * @type {boolean}
     */
    showCountOnSearch: null,

    /**
     * In which order the selected options should be displayed in trigger & sorted in `value` array.
     * Used for multi-select mode only.
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
        return includes(acceptableValues, value)
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
     * The value of the control.
     * Should be `id` or `node` object for single-select mode, or an array of `id` or `node` object for multi-select mode.
     * Its format depends on the `valueFormat` prop.
     * For most cases, just use `v-model` instead.
     * @type {?Array}
     */
    value: null,

    /**
     * Which kind of nodes should be included in the `value` array in multi-select mode
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
        return includes(acceptableValues, value)
      },
    },

    /**
     * Format of `value` prop.
     * Note that, when set to `"object"`, only `id` & `label` properties are required in each `node` object in `value` prop.
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
      trigger: {
        // is the control focused?
        isFocused: false,
        // user entered search query - value of the input
        searchQuery: '',
      },

      menu: {
        // is the menu opened?
        isOpen: false,
        // id of current highlighted option
        current: null,
        // the scroll position before last menu close
        lastScrollPosition: 0,
        // menu height
        optimizedHeight: 0,
        // which direction to open the menu
        prefferedOpenDirection: 'below',
      },

      forest: {
        // normalized options
        normalizedOptions: [],
        // <id, node> map for quick look-up
        nodeMap: createMap(),
        // <id, checkedState> map, used for multi-select mode
        checkedStateMap: createMap(),
        // id list of all selected options
        selectedNodeIds: this.extractCheckedNodeIdsFromValue(),
        // <id, true> map for fast checking:
        // if (forest.selectedNodeIds.indexOf(id) !== -1) forest.selectedNodeMap[id] === true
        selectedNodeMap: createMap(),
      },

      // States of root options
      rootOptionsStates: createAsyncOptionsStates(),

      localSearch: {
        // has user entered any query to search local options?
        active: false,
        // has any options matched the search query?
        noResults: true,
        // <id, countObject> map for counting matched children/descendants
        countMap: createMap(),
      },

      remoteSearch: {
        // has user entered any query to search async options?
        active: false,
        // states of async searching
        ...createAsyncOptionsStates(),
      },
    }
  },

  computed: {
    /* eslint-disable valid-jsdoc */
    /**
     * Normalized options that has been selected
     * @type {Object[]}
     */
    selectedNodes() {
      return this.forest.selectedNodeIds.map(this.getNode)
    },
    /**
     * Id list of selected nodes with `sortValueBy` prop applied
     * @type {nodeId[]}
     */
    internalValue() {
      let internalValue

      // istanbul ignore else
      if (this.single || this.flat || this.valueConsistsOf === ALL) {
        internalValue = this.forest.selectedNodeIds.slice()
      } else if (this.valueConsistsOf === BRANCH_PRIORITY) {
        internalValue = this.forest.selectedNodeIds.filter(id => {
          const node = this.getNode(id)
          if (node.isRootNode) return true
          return !this.isSelected(node.parentNode)
        })
      } else if (this.valueConsistsOf === LEAF_PRIORITY) {
        internalValue = this.forest.selectedNodeIds.filter(id => {
          const node = this.getNode(id)
          if (node.isLeaf) return true
          return node.children.length === 0
        })
      } else if (this.valueConsistsOf === ALL_WITH_INDETERMINATE) {
        const indeterminateNodeIds = []
        internalValue = this.forest.selectedNodeIds.slice()
        this.selectedNodes.forEach(selectedNode => {
          selectedNode.ancestors.forEach(ancestor => {
            if (includes(indeterminateNodeIds, ancestor.id)) return
            if (includes(internalValue, ancestor.id)) return
            indeterminateNodeIds.push(ancestor.id)
          })
        })
        internalValue.push(...indeterminateNodeIds)
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
     * Options displayed in the control
     * @type {Object[]}
     */
    visibleValue() {
      return this.internalValue.map(this.getNode).slice(0, this.limit)
    },
    /**
     * Id list of options displayed in the menu. Options that are considered NOT visible:
     *   - descendants of a collapsed branch node
     *   - in local search mode, options that are not matched, unless
     *       - it's a branch node and has matched descendants
     *       - it's a leaf node and its parent node is explicitly set to show all children
     * @type {id[]}
     */
    visibleOptionIds() {
      const visibleOptionIds = []

      this.traverseAllNodesByIndex(node => {
        if (!this.localSearch.active || this.shouldOptionBeIncludedInSearchResult(node)) {
          visibleOptionIds.push(node.id)
        }
        // skip the traversal of descendants of a branch node if it's not expanded
        if (node.isBranch && !this.shouldExpand(node)) {
          return false
        }
      })

      return visibleOptionIds
    },
    /**
     * Has any options should be displayed in the menu?
     * @type {boolean}
     */
    hasVisibleOptions() {
      if (!this.forest.normalizedOptions.length) {
        return false
      }
      if (this.localSearch.active) {
        return this.forest.normalizedOptions.some(option => this.shouldOptionBeIncludedInSearchResult(option))
      }
      return true
    },
    /**
     * Whether has passed the defined limit or not
     * @type {boolean}
     */
    hasExceededLimit() {
      return this.internalValue.length > this.limit
    },
    /**
     * Should the "×" button be shown?
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
    /**
     * Is there any branch node?
     * @type {boolean}
     */
    hasBranchNodes() {
      return this.forest.normalizedOptions.some(rootNode => rootNode.isBranch)
    },
    /**
     * The first option that should be displayed in the menu
     * @type {Object?}
     */
    firstVisibleOption() {
      if (!this.forest.normalizedOptions.length) return null
      if (this.localSearch.active) return find(this.forest.normalizedOptions, node => {
        return this.shouldOptionBeIncludedInSearchResult(node)
      })
      return this.forest.normalizedOptions[0]
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
      if (newValue && this.menu.isOpen) this.closeMenu()
      else if (!newValue && !this.menu.isOpen && this.alwaysOpen) this.openMenu()
    },

    flat() {
      this.initialize(this.options)
    },

    internalValue() {
      this.$emit('input', this.getValue(), this.getInstanceId())
    },

    matchKeys() {
      this.initialize(this.options)
    },

    multiple(newValue) {
      // needs to rebuild the state when switching from
      // single-select mode to multi-select mode
      if (newValue) this.buildForestState()
    },

    options: {
      handler() {
        // re-initialize options when the `options` prop has changed
        this.initialize(this.options)
        this.rootOptionsStates.isLoaded = Array.isArray(this.options)
      },
      deep: true,
      immediate: true,
    },

    'trigger.searchQuery': debounce(function onSearchQueryChange() {
      this.handleSearchQueryChange()
      this.$emit('search-change', this.trigger.searchQuery, this.getInstanceId())
    }, INPUT_DEBOUNCE_DELAY, { leading: true }),

    value() {
      const nodeIdsFromValue = this.extractCheckedNodeIdsFromValue()
      const hasChanged = quickDiff(nodeIdsFromValue, this.internalValue)

      if (hasChanged) this.fixSelectedNodeIds(nodeIdsFromValue)
    },
  },

  methods: {
    verifyProps() {
      warning(
        () => this.id == null,
        () => '`id` prop is deprecated. Use `instanceId` instead.'
      )

      warning(
        () => !this.autofocus,
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
    },

    initialize(rootOptions) {
      if (Array.isArray(rootOptions)) {
        // In case we are reinitializing options, keep the old state tree temporarily.
        const prevNodeMap = this.forest.nodeMap
        this.forest.nodeMap = createMap()
        this.keepDataOfSelectedNodes(prevNodeMap)
        this.forest.normalizedOptions = this.normalize(NO_PARENT_NODE, rootOptions, prevNodeMap)
        // Cases that need fix `selectedNodeIds`:
        //   1) Children options of a checked node have been delayed loaded,
        //      we should also mark these children as checked. (multi-select mode)
        //   2) Root options have been delayed loaded, we need to initialize states
        //      of these nodes. (multi-select mode)
        //   3) Async search mode.
        this.fixSelectedNodeIds(this.internalValue)
      } else {
        this.forest.normalizedOptions = []
      }
    },

    getInstanceId() {
      return this.instanceId == null ? this.id : this.instanceId
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

      return nodeId in this.forest.nodeMap
        ? this.forest.nodeMap[nodeId]
        : this.createFallbackNode(nodeId)
    },

    createFallbackNode(id) {
      // In case there is a default selected node that is not loaded into the tree yet,
      // we create a fallback node to keep the component working.
      // When the real data is loaded, we'll override this fake node.

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
        isNew: false,
        index: [ -1 ],
        level: 0,
        raw,
      }

      this.$set(this.forest.nodeMap, id, fallbackNode)
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

    fixSelectedNodeIds(prevValueArray) {
      let nextSelectedNodeIds = []

      // istanbul ignore else
      if (this.flat || this.single || this.valueConsistsOf === ALL) {
        nextSelectedNodeIds = prevValueArray
      } else if (this.valueConsistsOf === BRANCH_PRIORITY) {
        prevValueArray.forEach(nodeId => {
          nextSelectedNodeIds.push(nodeId)
          const node = this.getNode(nodeId)
          if (node.isBranch) this.traverseDescendantsBFS(node, descendant => {
            nextSelectedNodeIds.push(descendant.id)
          })
        })
      } else if (this.valueConsistsOf === LEAF_PRIORITY) {
        const map = createMap()
        const queue = prevValueArray.slice()
        while (queue.length) {
          const nodeId = queue.shift()
          const node = this.getNode(nodeId)
          nextSelectedNodeIds.push(nodeId)
          if (node.isRootNode) continue
          if (!(node.parentNode.id in map)) map[node.parentNode.id] = node.parentNode.children.length
          if (--map[node.parentNode.id] === 0) queue.push(node.parentNode.id)
        }
      } else if (this.valueConsistsOf === ALL_WITH_INDETERMINATE) {
        const map = createMap()
        const queue = prevValueArray.filter(nodeId => {
          const node = this.getNode(nodeId)
          return node.isLeaf || node.children.length === 0
        })
        while (queue.length) {
          const nodeId = queue.shift()
          const node = this.getNode(nodeId)
          nextSelectedNodeIds.push(nodeId)
          if (node.isRootNode) continue
          if (!(node.parentNode.id in map)) map[node.parentNode.id] = node.parentNode.children.length
          if (--map[node.parentNode.id] === 0) queue.push(node.parentNode.id)
        }
      }

      this.forest.selectedNodeIds = nextSelectedNodeIds
      this.buildForestState()
    },

    keepDataOfSelectedNodes(prevNodeMap) {
      // In case there is any selected node that is not present in the new `options` array.
      // It could be useful for async search mode.
      this.forest.selectedNodeIds.forEach(id => {
        if (!prevNodeMap[id]) return
        const fallbackNode = {
          ...prevNodeMap[id],
          isFallbackNode: true,
        }
        this.$set(this.forest.nodeMap, id, fallbackNode)
      })
    },

    isSelected(node) {
      // whether a node is selected (single-select mode) or fully-checked (multi-select mode)
      return this.forest.selectedNodeMap[node.id] === true
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
        // deep-level node first
        this.traverseDescendantsDFS(child, callback)
        callback(child)
      })
    },

    traverseAllNodesDFS(callback) {
      this.forest.normalizedOptions.forEach(rootNode => {
        // deep-level node first
        this.traverseDescendantsDFS(rootNode, callback)
        callback(rootNode)
      })
    },

    traverseAllNodesByIndex(callback) {
      const walk = parentNode => {
        parentNode.children.forEach(child => {
          if (callback(child) !== false && child.isBranch) {
            walk(child)
          }
        })
      }

      // To simplify the code logic of traversal,
      // we create a fake root node that holds all the root options.
      walk({
        isBranch: true,
        children: this.forest.normalizedOptions,
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

      const isClickedOnValueContainer = this.$refs.value.$el.contains(evt.target)
      if (isClickedOnValueContainer && !this.menu.isOpen && (this.openOnClick || this.trigger.isFocused)) {
        this.openMenu()
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

    handleSearchQueryChange() {
      if (this.trigger.searchQuery) {
        this.handleSearch()
      } else {
        this.exitSearchMode()
      }

      this.resetHighlightedOptionWhenNecessary(true)
    },

    handleSearch() {
      // enter search mode
      this.localSearch.active = true
      this.localSearch.noResults = true

      // reset state
      this.traverseAllNodesDFS(node => {
        if (node.isBranch) {
          node.isExpandedOnSearch = false
          node.showAllChildrenOnSearch = false
          node.isMatched = false
          node.hasMatchedDescendants = false
          this.$set(this.localSearch.countMap, node.id, {
            [ALL_CHILDREN]: 0,
            [ALL_DESCENDANTS]: 0,
            [LEAF_CHILDREN]: 0,
            [LEAF_DESCENDANTS]: 0,
          })
        }
      })

      const lowerCasedSearchQuery = this.trigger.searchQuery.trim().toLocaleLowerCase()
      const splitSearchQuery = lowerCasedSearchQuery.replace(/\s+/g, ' ').split(' ')
      this.traverseAllNodesDFS(node => {
        if (this.searchNested && splitSearchQuery.length > 1) {
          node.isMatched = splitSearchQuery.every(filterValue =>
            match(false, filterValue, node.nestedSearchLabel)
          )
        } else {
          node.isMatched = this.matchKeys.some(matchKey =>
            match(!this.disableFuzzyMatching, lowerCasedSearchQuery, node.lowerCased[matchKey])
          )
        }

        if (node.isMatched) {
          this.localSearch.noResults = false
          node.ancestors.forEach(ancestor => this.localSearch.countMap[ancestor.id][ALL_DESCENDANTS]++)
          if (node.isLeaf) node.ancestors.forEach(ancestor => this.localSearch.countMap[ancestor.id][LEAF_DESCENDANTS]++)
          if (node.parentNode !== NO_PARENT_NODE) {
            this.localSearch.countMap[node.parentNode.id][ALL_CHILDREN] += 1
            // istanbul ignore else
            if (node.isLeaf) this.localSearch.countMap[node.parentNode.id][LEAF_CHILDREN] += 1
          }
        }

        if (
          (node.isMatched || (node.isBranch && node.isExpandedOnSearch)) &&
          node.parentNode !== NO_PARENT_NODE
        ) {
          node.parentNode.isExpandedOnSearch = true
          node.parentNode.hasMatchedDescendants = true
        }
      })
    },

    exitSearchMode() {
      this.localSearch.active = false
    },

    shouldExpand(node) {
      return this.localSearch.active ? node.isExpandedOnSearch : node.isExpanded
    },

    isAllAncestorsExpanded(node) {
      return node.ancestors.every(ancestor => this.shouldExpand(ancestor))
    },

    shouldOptionBeIncludedInSearchResult(node) {
      // this option is matched
      if (node.isMatched) return true
      // this option is not matched, but has matched descendant(s)
      if (node.isBranch && node.hasMatchedDescendants) return true
      // this option's parent has no matched descendants,
      // but after being expanded, all its children should be shown
      if (!node.isRootNode && node.parentNode.showAllChildrenOnSearch) return true
      return false
    },

    shouldShowOptionInMenu(node, checkIfCollapsed = true) {
      if (checkIfCollapsed && !node.isRootNode && !this.isAllAncestorsExpanded(node)) {
        // this option belongs to a collapsed folder option
        return false
      }
      if (this.localSearch.active && !this.shouldOptionBeIncludedInSearchResult(node)) {
        return false
      }
      return true
    },

    setCurrentHighlightedOption(node, scroll = true) {
      if (!node) return

      this.menu.current = node.id

      if (scroll) {
        const $option = this.$el.querySelector(`.vue-treeselect__option[data-id="${node.id}"]`)
        if ($option) scrollIntoView(this.$refs.menu, $option)
      }
    },

    resetHighlightedOptionWhenNecessary(forceReset = false) {
      if (forceReset || this.menu.current == null || !this.shouldShowOptionInMenu(this.getNode(this.menu.current))) {
        this.setCurrentHighlightedOption(this.firstVisibleOption)
      }
    },

    highlightFirstOption() {
      if (!this.hasVisibleOptions) return

      const first = this.visibleOptionIds[0]
      this.setCurrentHighlightedOption(this.getNode(first))
    },

    highlightPrevOption() {
      if (!this.hasVisibleOptions) return

      const prev = this.visibleOptionIds.indexOf(this.menu.current) - 1
      if (prev === -1) return this.highlightLastOption()
      this.setCurrentHighlightedOption(this.getNode(this.visibleOptionIds[prev]))
    },

    highlightNextOption() {
      if (!this.hasVisibleOptions) return

      const next = this.visibleOptionIds.indexOf(this.menu.current) + 1
      if (next === this.visibleOptionIds.length) return this.highlightFirstOption()
      this.setCurrentHighlightedOption(this.getNode(this.visibleOptionIds[next]))
    },

    highlightLastOption() {
      if (!this.hasVisibleOptions) return

      const last = getLast(this.visibleOptionIds)
      this.setCurrentHighlightedOption(this.getNode(last))
    },

    closeMenu() {
      if (!this.menu.isOpen || (!this.disabled && this.alwaysOpen)) return
      this.saveMenuScrollPosition()
      this.menu.isOpen = false
      this.toggleClickOutsideEvent(false)
      // reset search query after menu closes
      this.trigger.searchQuery = ''
      this.$emit('close', this.getValue(), this.getInstanceId())
    },

    openMenu() {
      if (this.disabled || this.menu.isOpen) return
      this.menu.isOpen = true
      this.$nextTick(this.adjustMenuOpenDirection)
      this.$nextTick(this.restoreMenuScrollPosition)
      if (!this.options) this.loadRootOptions()
      this.toggleClickOutsideEvent(true)
      this.resetHighlightedOptionWhenNecessary()
      this.$emit('open', this.getInstanceId())
    },

    toggleMenu() {
      if (this.menu.isOpen) {
        this.closeMenu()
      } else {
        this.openMenu()
      }
    },

    toggleExpanded(node) {
      let nextState

      if (this.localSearch.active) {
        nextState = node.isExpandedOnSearch = !node.isExpandedOnSearch
        if (node.isExpandedOnSearch) node.showAllChildrenOnSearch = true
      } else {
        nextState = node.isExpanded = !node.isExpanded
      }

      if (nextState && !node.isLoaded) {
        // load children when expanded
        this.loadChildrenOptions(node)
      }
    },

    buildForestState() {
      const selectedNodeMap = createMap()
      this.forest.selectedNodeIds.forEach(selectedNodeId => {
        selectedNodeMap[selectedNodeId] = true
      })
      this.forest.selectedNodeMap = selectedNodeMap

      const checkedStateMap = createMap()
      if (this.multiple) {
        this.traverseAllNodesByIndex(node => {
          checkedStateMap[node.id] = UNCHECKED
        })

        this.selectedNodes.forEach(selectedNode => {
          checkedStateMap[selectedNode.id] = CHECKED

          if (!this.flat) selectedNode.ancestors.forEach(ancestorNode => {
            if (!this.isSelected(ancestorNode)) {
              checkedStateMap[ancestorNode.id] = INDETERMINATE
            }
          })
        })
      }
      this.forest.checkedStateMap = checkedStateMap
    },

    enhancedNormalizer(raw) {
      return {
        ...raw,
        ...this.normalizer(raw, this.getInstanceId()),
      }
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
          const isNew = !!node.isNew
          const lowerCased = this.matchKeys.reduce((prev, key) => ({
            ...prev,
            [key]: stringifyOptionPropValue(node[key]).toLocaleLowerCase(),
          }), {})
          const nestedSearchLabel = isRootNode
            ? lowerCased.label
            : parentNode.nestedSearchLabel + ' ' + lowerCased.label

          const normalized = this.$set(this.forest.nodeMap, id, createMap())
          this.$set(normalized, 'id', id)
          this.$set(normalized, 'label', label)
          this.$set(normalized, 'level', level)
          this.$set(normalized, 'ancestors', isRootNode ? [] : [ parentNode ].concat(parentNode.ancestors))
          this.$set(normalized, 'index', (isRootNode ? [] : parentNode.index).concat(index))
          this.$set(normalized, 'parentNode', parentNode)
          this.$set(normalized, 'lowerCased', lowerCased)
          this.$set(normalized, 'nestedSearchLabel', nestedSearchLabel)
          this.$set(normalized, 'isDisabled', isDisabled)
          this.$set(normalized, 'isNew', isNew)
          this.$set(normalized, 'isMatched', false)
          this.$set(normalized, 'isBranch', isBranch)
          this.$set(normalized, 'isLeaf', isLeaf)
          this.$set(normalized, 'isRootNode', isRootNode)
          this.$set(normalized, 'raw', raw)

          if (isBranch) {
            const isLoaded = Array.isArray(children)

            this.$set(normalized, 'childrenStates', {
              ...createAsyncOptionsStates(),
              isLoaded,
            })
            this.$set(normalized, 'isExpanded', typeof isDefaultExpanded === 'boolean'
              ? isDefaultExpanded
              : level < this.defaultExpandLevel)
            this.$set(normalized, 'hasMatchedDescendants', false)
            this.$set(normalized, 'hasDisabledDescendants', false)
            this.$set(normalized, 'isExpandedOnSearch', false)
            this.$set(normalized, 'showAllChildrenOnSearch', false)
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

          normalized.ancestors.forEach(ancestor => ancestor.count[ALL_DESCENDANTS]++)
          if (isLeaf) normalized.ancestors.forEach(ancestor => ancestor.count[LEAF_DESCENDANTS]++)
          if (!isRootNode) {
            parentNode.count[ALL_CHILDREN] += 1
            if (isLeaf) parentNode.count[LEAF_CHILDREN] += 1
            if (isDisabled) parentNode.hasDisabledDescendants = true
          }

          // preserve previous states
          if (prevNodeMap && prevNodeMap[id]) {
            const prev = prevNodeMap[id]
            if (prev.isBranch && normalized.isBranch) {
              normalized.isExpanded = prev.isExpanded
              normalized.isExpandedOnSearch = prev.isExpandedOnSearch
              // #97
              // if `isLoaded` was true, but NOT now, we consider
              // this branch node to be reset to unloaded state by the user of this component
              if (prev.childrenStates.isLoaded && !normalized.childrenStates.isLoaded) {
                // make sure the node is collapsed, then the user can load its children again (by expanding)
                normalized.isExpanded = false
                // we have reset `childrenStates` and don't want to preserve states here
              } else {
                normalized.childrenStates = { ...prev.childrenStates }
              }
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
          return this.rootOptionsStates.isLoading
        },
        start: () => {
          this.rootOptionsStates.isLoading = true
          this.rootOptionsStates.loadingError = ''
        },
        succeed: () => {
          this.rootOptionsStates.isLoaded = true
        },
        fail: err => {
          this.rootOptionsStates.loadingError = err.message || String(err)
        },
        end: () => {
          this.rootOptionsStates.isLoading = false
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
          return this.getNode(id).childrenStates.isLoading
        },
        start: () => {
          this.getNode(id).childrenStates.isLoading = true
          this.getNode(id).childrenStates.loadingError = ''
        },
        succeed: () => {
          this.getNode(id).childrenStates.isLoaded = true
        },
        fail: err => {
          this.getNode(id).childrenStates.loadingError = err.message || String(err)
        },
        end: () => {
          this.getNode(id).childrenStates.isLoading = false
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
      const result = this.loadOptions({
        id: this.getInstanceId(),
        instanceId: this.getInstanceId(),
        action,
        ...args,
        callback,
      })

      if (isPromise(result)) {
        result.then(() => {
          callback()
        }, err => {
          callback(err)
        }).catch(err => {
          // istanbul ignore next
          console.error(err)
        })
      }
    },

    checkDuplication(node) {
      warning(
        () => !((node.id in this.forest.nodeMap) && !this.forest.nodeMap[node.id].isFallbackNode),
        () => `Detected duplicate presence of node id ${JSON.stringify(node.id)}. ` +
          `Their labels are "${this.forest.nodeMap[node.id].label}" and "${node.label}" respectively.`
      )
    },

    verifyNodeShape(node) {
      warning(
        () => !(node.children === undefined && node.isBranch === true),
        () => 'Are you meant to declare an unloaded branch node? ' +
          '`isBranch: true` is no longer supported, please use `children: null` instead.'
      )
    },

    select(node) {
      if (this.disabled || node.isDisabled) {
        return
      }

      if (this.single) {
        this.clear()
      }

      const state = this.multiple && !this.flat
        ? this.forest.checkedStateMap[node.id] === UNCHECKED
        : !this.isSelected(node)

      if (state) {
        this._selectNode(node)
      } else {
        this._deselectNode(node)
      }

      this.buildForestState()

      if (state) {
        this.$emit('select', node.raw, this.getInstanceId())
      } else {
        this.$emit('deselect', node.raw, this.getInstanceId())
      }

      if (this.localSearch.active && state && (this.single || this.clearOnSelect)) {
        this.trigger.searchQuery = ''
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
        this.forest.selectedNodeIds = this.multiple
          ? this.forest.selectedNodeIds.filter(nodeId => this.getNode(nodeId).isDisabled)
          : []
        this.buildForestState()
      }
    },

    _selectNode(node) {
      if (this.single || this.flat || this.disableBranchNodes) {
        this.addValue(node)
        return
      }

      if (node.isLeaf || (node.isBranch && !node.hasDisabledDescendants)) {
        this.addValue(node)
      }

      if (node.isBranch) {
        this.traverseDescendantsBFS(node, descendant => {
          if (!descendant.isDisabled) this.addValue(descendant)
        })
      }

      if (node.isLeaf || (node.isBranch && !node.hasDisabledDescendants)) {
        let curr = node
        while ((curr = curr.parentNode) !== NO_PARENT_NODE) {
          if (curr.children.every(this.isSelected)) this.addValue(curr)
          else break
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

      if (
        node.isLeaf ||
        /* node.isBranch && */hasUncheckedSomeDescendants ||
        /* node.isBranch && */node.children.length === 0
      ) {
        this.removeValue(node)

        let curr = node
        while ((curr = curr.parentNode) !== NO_PARENT_NODE) {
          if (this.isSelected(curr)) this.removeValue(curr)
          else break
        }
      }
    },

    addValue(node) {
      this.forest.selectedNodeIds.push(node.id)
      this.forest.selectedNodeMap[node.id] = true
    },

    removeValue(node) {
      removeFromArray(this.forest.selectedNodeIds, node.id)
      delete this.forest.selectedNodeMap[node.id]
    },

    removeLastValue() {
      if (!this.hasValue) return
      if (this.single) return this.clear()
      const lastValue = getLast(this.internalValue)
      const lastSelectedNode = this.getNode(lastValue)
      this.select(lastSelectedNode) // deselect
    },

    saveMenuScrollPosition() {
      if (this.$refs.menu) this.menu.lastScrollPosition = this.$refs.menu.scrollTop
    },

    restoreMenuScrollPosition() {
      if (this.$refs.menu) this.$refs.menu.scrollTop = this.menu.lastScrollPosition
    },

    adjustMenuOpenDirection() {
      // istanbul ignore next
      if (typeof window === 'undefined') return

      const rect = this.$el.getBoundingClientRect()
      const spaceAbove = rect.top
      const spaceBelow = window.innerHeight - rect.bottom
      const hasEnoughSpaceBelow = spaceBelow > this.maxHeight
      const isInViewport = rect.top > 0 && (window.innerHeight - rect.top) > MENU_BUFFER

      switch (true) {
      case hasEnoughSpaceBelow:
      case spaceBelow > spaceAbove:
      case !isInViewport:
      case this.openDirection === 'below':
      case this.openDirection === 'bottom':
        this.menu.prefferedOpenDirection = 'below'
        this.menu.optimizedHeight = Math.max(Math.min(spaceBelow - MENU_BUFFER, this.maxHeight), this.maxHeight)
        break

      default:
        this.menu.prefferedOpenDirection = 'above'
        this.menu.optimizedHeight = Math.min(spaceAbove - MENU_BUFFER, this.maxHeight)
      }
    },
  },

  created() {
    this.verifyProps()
    this.resetFlags()
  },

  mounted() {
    if (this.autoFocus || this.autofocus) this.$refs.value.focusInput()
    if (!this.options && this.autoLoadRootOptions) this.loadRootOptions()
    if (this.alwaysOpen) this.openMenu()
  },

  destroyed() {
    // istanbul ignore next
    this.toggleClickOutsideEvent(false)
  },
}
