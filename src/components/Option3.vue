<script>
  import { UNCHECKED, INDETERMINATE, CHECKED } from '../constants'
  import { onLeftClick } from '../utils'
  // import Tip from './Tip'
  import ArrowIcon from './icons/Arrow'

  let arrowPlaceholder, checkMark, minusMark
  let time

  const Option = {
    name: 'vue-treeselect--option',
    inject: [ 'instance' ],

    props: {
      normalizedOptions: {
        type: Array,
        required: true,
      },
    },

    data() {
      return {
        oldList: [],
        zeroList: [],
        renderList: [],
        virtualList: [],
        totalHeight: 0,
        marginTop: 0,
        scrollBox: null,
        // 空函数，被替换
        scrollFun: null,
      }
    },

    computed: {
    },

    watch: {
      // 数据初始化
      'normalizedOptions': {
        immediate: true,
        handler(newData) {
          const oldList = []
          this.handleNodeData(newData, oldList, 0)
          this.oldList = oldList
          this.zeroList = oldList.filter(item => item.level === 0)
          this.mergeRenderList()
        },
      },

      // 监听搜索
      'instance.localSearch.countMap': {
        immediate: true,
        deep: true,
        handler() {
          this.mergeRenderList()
        },
      },

      'instance.localSearch.active': {
        immediate: true,
        deep: true,
        handler() {
          this.mergeRenderList()
        },
      },

      'instance.localSearch.noResults': {
        immediate: true,
        deep: true,
        handler() {
          this.mergeRenderList()
        },
      },
    },

    methods: {
      shouldExpand(node) {
        const { instance } = this

        return node.isBranch && instance.shouldExpand(node)
      },

      shouldShow(node) {
        const { instance } = this

        return instance.shouldShowOptionInMenu(node)
      },

      renderOption(node) {
        const { instance } = this
        const optionClass = {
          'vue-treeselect__option': true,
          'vue-treeselect__option--disabled': node.isDisabled,
          'vue-treeselect__option--selected': instance.isSelected(node),
          'vue-treeselect__option--highlight': node.isHighlighted,
          'vue-treeselect__option--matched': instance.localSearch.active && node.isMatched,
          // 'vue-treeselect__option--hide': !this.shouldShow(node),
          'vue-treeselect__option--hide': false,
        }

        return (
          <div class={optionClass} onMouseenter={evt => this.handleMouseEnterOption(evt, node)} data-id={node.id}>
            {this.renderArrow(node)}
            {this.renderLabelContainer([
              this.renderCheckboxContainer([
                this.renderCheckbox(node),
              ], node),
              this.renderLabel(node),
            ], node)}
          </div>
        )
      },

      renderArrow(node) {
        const { instance } = this

        // if (instance.shouldFlattenOptions && this.shouldShow(node)) return null

        if (node.isBranch) {
          const transitionProps = {
            props: {
              name: 'vue-treeselect__option-arrow--prepare',
              appear: true,
            },
          }
          const arrowClass = {
            'vue-treeselect__option-arrow': true,
            'vue-treeselect__option-arrow--rotated': this.shouldExpand(node),
          }

          return (
            <div class="vue-treeselect__option-arrow-container" onMousedown={$event => this.handleMouseDownOnArrow($event, node)}>
              <transition {...transitionProps}>
                <ArrowIcon class={arrowClass} />
              </transition>
            </div>
          )
        }

        // For leaf nodes, we render a placeholder to keep its label aligned to
        // branch nodes. Unless there is no branch nodes at all (a normal
        // non-tree select).
        if (/*node.isLeaf && */instance.hasBranchNodes) {
          if (!arrowPlaceholder) arrowPlaceholder = (
            <div class="vue-treeselect__option-arrow-placeholder">&nbsp;</div>
          )

          return arrowPlaceholder
        }

        return null
      },

      renderLabelContainer(children, node) {
        return (
          <div class="vue-treeselect__label-container" onMousedown={$event => this.handleMouseDownOnLabelContainer($event, node)}>
            {children}
          </div>
        )
      },

      renderCheckboxContainer(children, node) {
        const { instance } = this

        if (instance.single) return null
        if (instance.disableBranchNodes && node.isBranch) return null

        return (
          <div class="vue-treeselect__checkbox-container">
            {children}
          </div>
        )
      },

      renderCheckbox(node) {
        const { instance } = this
        const checkedState = instance.forest.checkedStateMap[node.id]
        const checkboxClass = {
          'vue-treeselect__checkbox': true,
          'vue-treeselect__checkbox--checked': checkedState === CHECKED,
          'vue-treeselect__checkbox--indeterminate': checkedState === INDETERMINATE,
          'vue-treeselect__checkbox--unchecked': checkedState === UNCHECKED,
          'vue-treeselect__checkbox--disabled': node.isDisabled,
        }

        if (!checkMark) checkMark = (
          <span class="vue-treeselect__check-mark" />
        )
        if (!minusMark) minusMark = (
          <span class="vue-treeselect__minus-mark" />
        )

        return (
          <span class={checkboxClass}>
            {checkMark}
            {minusMark}
          </span>
        )
      },

      renderLabel(node) {
        const { instance } = this
        const shouldShowCount = (
          node.isBranch && (instance.localSearch.active
            ? instance.showCountOnSearchComputed
            : instance.showCount
          )
        )
        const count = shouldShowCount
          ? instance.localSearch.active
            ? instance.localSearch.countMap[node.id][instance.showCountOf]
            : node.count[instance.showCountOf]
          : NaN
        const labelClassName = 'vue-treeselect__label'
        const countClassName = 'vue-treeselect__count'
        const customLabelRenderer = instance.$scopedSlots['option-label']

        if (customLabelRenderer) return customLabelRenderer({
          node,
          shouldShowCount,
          count,
          labelClassName,
          countClassName,
        })

        return (
          <label class={labelClassName}>
            {node.label}
            {shouldShowCount && (
              <span class={countClassName}>({count})</span>
            )}
          </label>
        )
      },

      handleMouseEnterOption(evt, node) {
        const { instance } = this
        // Equivalent to `self` modifier.
        // istanbul ignore next
        if (evt.target !== evt.currentTarget) return

        instance.setCurrentHighlightedOption(node, false)
      },

      toggleExpanded(node) {
        const { instance } = this
        if (instance.localSearch.active) {
          node.isExpandedOnSearch = !node.isExpandedOnSearch
        } else {
          node.isExpanded = !node.isExpanded
        }
      },

      handleMouseDownOnArrow: onLeftClick(function handleMouseDownOnOptionArrow(evt, node) {
        // const { instance } = this
        // const {childrenIndexs} = node;
        // oldList.slice(childrenIndexs[0], childrenIndexs[childrenIndexs.length - 1]);
        this.toggleExpanded(node)
        this.mergeRenderList()
      }),

      handleMouseDownOnLabelContainer: onLeftClick(function handleMouseDownOnLabelContainer(evt, node) {
        const { instance } = this

        if (node.isBranch && instance.disableBranchNodes) {
          this.toggleExpanded(node)
          this.mergeRenderList()
        } else {
          instance.select(node)
        }
      }),

      // 平铺数据
      handleNodeData(list, arr, level, childrenIndex, cascadeIndex, cascadeId) {
        if (!list || !list.length) return
        list.forEach((item, index) => {
          const newItem = item
          const isChild = !!newItem.children

          // newItem.isLeaf = true
          // newItem.isBranch = false
          // newItem.nestedSearchLabel = [ newItem.label ].join(' ')
          // 原数据对象
          // newItem.raw = item
          // 父对象
          // newItem.parent = parentItem
          // 当前等级
          // newItem.level = level

          // 数据对应的下标
          newItem.dataIndex = arr.length

          // 原数据级联下标
          newItem.oldCascadeIndex = Array.isArray(cascadeIndex) ? [ ...cascadeIndex ] : []
          newItem.oldCascadeIndex.push(index)

          // 原数据级联id
          newItem.oldCascadeId = Array.isArray(cascadeId) ? [ ...cascadeId ] : []
          newItem.oldCascadeId.push(newItem.id)

          arr.push(newItem)

          if (childrenIndex) {
            childrenIndex.push(arr.length)
          }

          if (isChild) {
            // 收集子集下标
            const cIndexs = newItem.childrenIndexs = childrenIndex || []
            cIndexs.push(arr.length)

            // newItem.isLeaf = false
            // newItem.isBranch = true

            this.handleNodeData(newItem.children, arr, level + 1, cIndexs, newItem.oldCascadeIndex, newItem.oldCascadeId)
          }
        })
      },

      // 处理渲染数据
      handleRenderList() {
        const { oldList, zeroList } = this
        const arr = []

        // 根下标
        let rootIndex = 0
        // 数据下标
        let index = 0

        do {
          if (!arr.length) {
            // 没值的时候
            arr.push(zeroList[rootIndex++])
          } else if (arr.length === index) {
            const node = zeroList[rootIndex]
            if (node) {
              // 下标等于数组长度时候
              arr.push(node)
              rootIndex++
            } else {
              // 为空的时候
              break
            }
          } else {
            const node = arr[index++]
            if (node && node.isBranch && node.isExpanded) {
              const data = oldList.slice(node.childrenIndexs[0], node.childrenIndexs[node.childrenIndexs.length - 1])
              arr.push(...data)
            }
          }
        } while (true)

        this.renderList = arr
        this.scrollFun()
      },

      // 处理搜索的渲染数据
      handleSearchRenderList() {
        const { oldList } = this

        const arr = []
        // hasMatchedDescendants
        // isMatched
        oldList.forEach(item => {
          if (!item.hasMatchedDescendants && item.isMatched && item.isExpandedOnSearch) {
            arr.push(item, ...item.children)
          } else if ((item.hasMatchedDescendants || item.isMatched) && (item.parentNode ? item.parentNode.isExpandedOnSearch : true)) {
            arr.push(item)
          }
        })

        this.renderList = arr
        this.scrollFun()
      },

      // 合并起来处理
      mergeRenderList() {
        clearTimeout(time)
        this.$nextTick(() => {
          time = setTimeout(() => {
            const active = this.instance.localSearch.active
            active ? this.handleSearchRenderList() : this.handleRenderList()
          }, 0)
        })
      },

      // 监听滚动，以及处理函数(设置虚拟列表)
      handleScroll() {
        if (this.scrollFun) return

        const box = this.scrollBox = this.$refs.dom.parentElement
        const boxHeight = parseFloat(box.style.maxHeight)
        const rowHeight = this.instance.virtualRowHeight
        const rows = Math.ceil(boxHeight / rowHeight)

        const fn = () => {
          let virtualList = []
          let marginTop = 0
          let dataHeight = 0

          const renderList = this.renderList
          const totalHeight = renderList.length * rowHeight
          const scrollTop = box.scrollTop
          const startIndex = Math.floor(scrollTop / rowHeight)
          const endIndex = startIndex + rows


          virtualList = renderList.slice(startIndex, endIndex)
          dataHeight = virtualList.length * rowHeight

          if (scrollTop + dataHeight >= totalHeight) {
            // 临界点处理
            marginTop = Math.min(scrollTop, totalHeight - dataHeight)
          } else {
            marginTop = scrollTop
          }

          this.marginTop = marginTop
          this.totalHeight = totalHeight
          this.virtualList = virtualList
        }

        fn()
        this.scrollFun = fn
        box.addEventListener('scroll', this.scrollFun, false)
      },
    },

    mounted() {
      this.handleScroll()
    },

    beforeDestroy() {
      const box = this.scrollBox
      if (box) {
        box.removeEventListener('scroll', this.scrollFun, false)
      }
    },

    render() {
      const { virtualList, totalHeight, marginTop, instance } = this

      return (
        <div class="vue-treeselect__list" ref="dom">
          <div style={{ width: 0, float: 'left', height: totalHeight + 'px' }}></div>
          <div style={{ paddingTop: marginTop + 'px' }}>
            {virtualList.map(node => (
              <div
                key={node.id}
                class={{
                  'vue-treeselect__list-item': true,
                  [`vue-treeselect__indent-level-${node.level}`]: true,
                }}
                style={{
                  lineHeight: instance.virtualRowHeight + 'px',
                }}
              >
                {this.renderOption(node)}
              </div>
            ))}
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
      )
    },
  }

  // eslint-disable-next-line vue/require-direct-export
  export default Option
</script>
