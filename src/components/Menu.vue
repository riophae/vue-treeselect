<script>
  import Option from './Option'
  import Tip from './Tip'

  export default {
    name: 'vue-treeselect--menu',
    inject: [ 'instance' ],

    computed: {
      menuStyle() {
        const { instance } = this

        return {
          maxHeight: instance.menu.optimizedHeight + 'px',
          zIndex: instance.appendToBody ? null : instance.zIndex,
        }
      },
    },

    methods: {
      renderMenu() {
        const { instance } = this

        if (!instance.menu.isOpen) return null

        return (
          <div class="vue-treeselect__menu" onMousedown={instance.handleMouseDown} style={this.menuStyle}>
            {instance.async
              ? this.renderAsyncSearchMenuInner()
              : instance.localSearch.active
                ? this.renderLocalSearchMenuInner()
                : this.renderNormalMenuInner()}
          </div>
        )
      },

      renderNormalMenuInner() {
        const { instance } = this

        if (instance.rootOptionsStates.isLoading) {
          return this.renderLoadingOptionsTip()
        } else if (instance.rootOptionsStates.loadingError) {
          return this.renderLoadingRootOptionsErrorTip()
        } else if (instance.rootOptionsStates.isLoaded && instance.forest.normalizedOptions.length === 0) {
          return this.renderNoAvailableOptionsTip()
        } else {
          return this.renderOptionList()
        }
      },

      renderLocalSearchMenuInner() {
        const { instance } = this

        if (instance.rootOptionsStates.isLoading) {
          return this.renderLoadingOptionsTip()
        } else if (instance.rootOptionsStates.loadingError) {
          return this.renderLoadingRootOptionsErrorTip()
        } else if (instance.rootOptionsStates.isLoaded && instance.forest.normalizedOptions.length === 0) {
          return this.renderNoAvailableOptionsTip()
        } else if (instance.localSearch.noResults) {
          return this.renderNoResultsTip()
        } else {
          return this.renderOptionList()
        }
      },

      renderAsyncSearchMenuInner() {
        const { instance } = this
        const entry = instance.getRemoteSearchEntry()

        const shouldShowSearchPromptTip = instance.trigger.searchQuery === '' && !instance.defaultOptions
        const shouldShowNoResultsTip = shouldShowSearchPromptTip
          ? false
          : entry.isLoaded && entry.options.length === 0

        if (shouldShowSearchPromptTip) {
          return this.renderSearchPromptTip()
        } else if (entry.isLoading) {
          return this.renderLoadingOptionsTip()
        } else if (entry.loadingError) {
          return this.renderAsyncSearchLoadingErrorTip()
        } else if (shouldShowNoResultsTip) {
          return this.renderNoResultsTip()
        } else {
          return this.renderOptionList()
        }
      },

      renderOptionList() {
        const { instance } = this

        return (
          <div class="vue-treeselect__list">
            {instance.forest.normalizedOptions.map(rootNode => (
              <Option node={rootNode} key={rootNode.id} />
            ))}
          </div>
        )
      },

      renderSearchPromptTip() {
        const { instance } = this

        return (
          <Tip type="search-prompt" icon="warning">{ instance.searchPromptText }</Tip>
        )
      },

      renderLoadingOptionsTip() {
        const { instance } = this

        return (
          <Tip type="loading" icon="loader">{ instance.loadingText }</Tip>
        )
      },

      renderLoadingRootOptionsErrorTip() {
        const { instance } = this

        return (
          <Tip type="error" icon="error">
            { instance.rootOptionsStates.loadingError }
            <a class="vue-treeselect__retry" onClick={instance.loadRootOptions} title={instance.retryTitle}>
              { instance.retryText }
            </a>
          </Tip>
        )
      },

      renderAsyncSearchLoadingErrorTip() {
        const { instance } = this
        const entry = instance.getRemoteSearchEntry()

        // TODO: retryTitle?

        return (
          <Tip type="error" icon="error">
            { entry.loadingError }
            <a class="vue-treeselect__retry" onClick={instance.handleRemoteSearch} title={instance.retryTitle}>
              { instance.retryText }
            </a>
          </Tip>
        )
      },

      renderNoAvailableOptionsTip() {
        const { instance } = this

        return (
          <Tip type="no-options" icon="warning">{ instance.noOptionsText }</Tip>
        )
      },

      renderNoResultsTip() {
        const { instance } = this

        return (
          <Tip type="no-results" icon="warning">{ instance.noResultsText }</Tip>
        )
      },
    },

    render() {
      return (
        <transition name="vue-treeselect__menu--transition">
          {this.renderMenu()}
        </transition>
      )
    },
  }
</script>
