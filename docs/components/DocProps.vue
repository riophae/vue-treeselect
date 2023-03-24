<template>
  <table class="striped">
    <thead>
      <tr>
        <th class="name">Name</th>
        <th>Type / Default</th>
        <th class="desc">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="prop in props" :key="prop[0]">
        <td><strong>{{ prop.name }}</strong></td>
        <td class="type">
          <strong>Type: </strong><span v-html="prop.type" />
          <br>
          <strong>Default: </strong><span v-html="prop.defaultValue" />
        </td>
        <td v-html="prop.description" />
      </tr>
    </tbody>
  </table>
</template>

<script>
  /* eslint-disable no-template-curly-in-string */
  import { encodeHTML } from 'entities'
  import { code, strong, link, makeArgNameList, makePropList } from './utils'

  const NO_DEFAULT_VALUE = '–'

  export default {
    data: () => ({
      props: [ {
        name: 'allowClearingDisabled',
        type: 'Boolean',
        defaultValue: code('false'),
        description: 'Whether to allow resetting value even if there are disabled selected nodes.',
      }, {
        name: 'allowSelectingDisabledDescendants',
        type: 'Boolean',
        defaultValue: code('false'),
        description: `When an ancestor node is selected/deselected, whether its disabled descendants should be selected/deselected. You may want to use this in conjunction with ${code('allowClearingDisabled')} prop.`,
      }, {
        name: 'alwaysOpen',
        type: 'Boolean',
        defaultValue: code('false'),
        description: 'Whether the menu should be always open.',
      }, {
        name: 'appendToBody',
        type: 'Boolean',
        defaultValue: code('false'),
        description: `Append the menu to ${code('<body />')}.`,
      }, {
        name: 'async',
        type: 'Boolean',
        defaultValue: code('false'),
        description: `Whether to enable ${link('#async-searching', 'async search mode')}.`,
      }, {
        name: 'autoFocus',
        type: 'Boolean',
        defaultValue: code('false'),
        description: 'Automatically focus the component on mount.',
      }, {
        name: 'autoLoadRootOptions',
        type: 'Boolean',
        defaultValue: code('true'),
        description: `Automatically load root options on mount. When set to ${code('false')}, root options will be loaded when the menu is opened.`,
      }, {
        name: 'autoDeselectAncestors',
        type: 'Boolean',
        defaultValue: code('false'),
        description: 'When user deselects a node, automatically deselect its ancestors. Applies to flat mode only.',
      }, {
        name: 'autoDeselectDescendants',
        type: 'Boolean',
        defaultValue: code('false'),
        description: 'When user deselects a node, automatically deselect its descendants. Applies to flat mode only.',
      }, {
        name: 'autoSelectAncestors',
        type: 'Boolean',
        defaultValue: code('false'),
        description: 'When user selects a node, automatically select its ancestors. Applies to flat mode only.',
      }, {
        name: 'autoSelectDescendants',
        type: 'Boolean',
        defaultValue: code('false'),
        description: 'When user selects a node, automatically select its descendants. Applies to flat mode only.',
      }, {
        name: 'backspaceRemoves',
        type: 'Boolean',
        defaultValue: code('true'),
        description: 'Whether <kbd>Backspace</kbd> removes the last item if there is no text input.',
      }, {
        name: 'beforeClearAll',
        type: encodeHTML(`Fn${makeArgNameList([])} 🡒 (Boolean | Promise<Boolean>)`),
        defaultValue: code('() => true'),
        description: `Function that processes before clearing all input fields. Return ${code('false')} to stop values being cleared.`,
      }, {
        name: 'branchNodesFirst',
        type: 'Boolean',
        defaultValue: code('false'),
        description: 'Show branch nodes before leaf nodes.',
      }, {
        name: 'cacheOptions',
        type: 'Boolean',
        defaultValue: code('true'),
        description: `Whether to cache results of each search request for ${link('#async-searching', 'async search mode')}.`,
      }, {
        name: 'clearable',
        type: 'Boolean',
        defaultValue: code('true'),
        description: 'Whether to show an "×" button that resets value.',
      }, {
        name: 'clearAllText',
        type: 'String',
        defaultValue: code('"Clear all"'),
        description: `Title for the "×" button when ${code(':multiple="true"')}.`,
      }, {
        name: 'clearOnSelect',
        type: 'Boolean',
        defaultValue: `Defaults to ${code('false')} when ${code(':multiple="true"')}; always ${code('true')} otherwise.`,
        description: `Whether to clear the search input after selecting an option. Use only when ${code(':multiple="true"')}. For single-select mode, it ${strong('always')} clears the input after selecting regardless of the prop value.`,
      }, {
        name: 'clearValueText',
        type: 'String',
        defaultValue: code('"Clear value"'),
        description: 'Title for the "×" button.',
      }, {
        name: 'closeOnSelect',
        type: 'Boolean',
        defaultValue: code('true'),
        description: `Whether to close the menu after selecting an option. Use only when ${code(':multiple="true"')}.`,
      }, {
        name: 'defaultExpandLevel',
        type: 'Number',
        defaultValue: code('0'),
        description: `How many levels of branch nodes should be automatically expanded when loaded. Set ${code('Infinity')} to make all branch nodes expanded by default.`,
      }, {
        name: 'defaultOptions',
        type: `Boolean | ${code('node[]')}`,
        defaultValue: code('false'),
        description: `The default set of options to show before the user starts searching. Used for ${link('#async-searching', 'async search mode')}. When set to ${code('true')}, the results for search query as a empty string will be autoloaded.`,
      }, {
        name: 'deleteRemoves',
        type: 'Boolean',
        defaultValue: code('true'),
        description: 'Whether <kbd>Delete</kbd> removes the last item if there is no text input.',
      }, {
        name: 'delimiter',
        type: 'String',
        defaultValue: code('","'),
        description: `Delimiter to use to join multiple values for the hidden field value.`,
      }, {
        name: 'flattenSearchResults',
        type: 'Boolean',
        defaultValue: code('false'),
        description: `Whether to flatten the tree when searching (sync search mode only). See ${link('#flatten-search-results')} for example.`,
      }, {
        name: 'disableBranchNodes',
        type: 'Boolean',
        defaultValue: code('false'),
        description: `Whether to prevent branch nodes from being selected. See ${link('#disable-branch-nodes')} for example.`,
      }, {
        name: 'disabled',
        type: 'Boolean',
        defaultValue: code('false'),
        description: 'Whether to disable the control or not.',
      }, {
        name: 'disableFuzzyMatching',
        type: 'Boolean',
        defaultValue: code('false'),
        description: `Set to ${code('true')} to disable the fuzzy matching functionality, which is enabled by default.`,
      }, {
        name: 'flat',
        type: 'Boolean',
        defaultValue: code('false'),
        description: `Whether to enable flat mode or not. See ${link('#flat-mode-and-sort-values')} for detailed information.`,
      }, {
        name: 'instanceId',
        type: 'String | Number',
        defaultValue: code('"<auto-incrementing number>$$"'),
        description: 'Will be passed with all events as the last param. Useful for identifying events origin.',
      }, {
        name: 'joinValues',
        type: 'Boolean',
        defaultValue: code('false'),
        description: `Joins multiple values into a single form field with the ${code('delimiter')} (legacy mode).`,
      }, {
        name: 'limit',
        type: 'Number',
        defaultValue: code('Infinity'),
        description: `Limit the display of selected options. The rest will be hidden within the ${code('limitText')} string.`,
      }, {
        name: 'limitText',
        type: `Fn${makeArgNameList([ 'count' ])} 🡒 String`,
        defaultValue: code('count => `and ${count} more`'),
        description: 'Function that processes the message shown when selected elements pass the defined limit.',
      }, {
        name: 'loadingText',
        type: 'String',
        defaultValue: code('"Loading..."'),
        description: 'Text displayed when loading options.',
      }, {
        name: 'loadOptions',
        type: `Fn(${makePropList([ 'action', 'callback', 'parentNode?', 'instanceId' ])}) 🡒 (${code('void')} | Promise)`,
        defaultValue: NO_DEFAULT_VALUE,
        description: [
          `Used for dynamically loading options. See ${link('#delayed-loading')} for detailed information.`,
          `Possible values of ${code('action')}: ${code('"LOAD_ROOT_OPTIONS"')}, ${code('"LOAD_CHILDREN_OPTIONS"')} or ${code('"ASYNC_SEARCH"')}.`,
          `${code('callback')} - a function that accepts an optional ${code('error')} argument`,
          `${code('parentNode')} - only presents when loading children options`,
          `${code('searchQuery')} - only presents when searching async options`,
          `${code('instanceId')} - eqauls to the value of ${code('instanceId')} prop you passed to vue-treeselect`,
        ].join('<br>'),
      }, {
        name: 'matchKeys',
        type: 'String[]',
        defaultValue: code('[ "label" ]'),
        description: `Which keys of a ${code('node')} object to filter on.`,
      }, {
        name: 'maxHeight',
        type: 'Number',
        defaultValue: code('300'),
        description: `Sets ${code('maxHeight')} style value of the menu.`,
      }, {
        name: 'multiple',
        type: 'Boolean',
        defaultValue: code('false'),
        description: `Set ${code('true')} to allow selecting multiple options (a.k.a., multi-select mode).`,
      }, {
        name: 'name',
        type: 'String',
        defaultValue: NO_DEFAULT_VALUE,
        description: `Generates a hidden ${code('<input />')} tag with this field name for html forms.`,
      }, {
        name: 'noChildrenText',
        type: 'String',
        defaultValue: code('"No sub-options."'),
        description: 'Text displayed when a branch node has no children.',
      }, {
        name: 'noOptionsText',
        type: 'String',
        defaultValue: code('"No options available."'),
        description: 'Text displayed when there are no available options.',
      }, {
        name: 'noResultsText',
        type: 'String',
        defaultValue: code('"No results found..."'),
        description: 'Text displayed when there are no matching search results.',
      }, {
        name: 'normalizer',
        type: `Fn${makeArgNameList([ 'node', 'instanceId' ])} 🡒 ${code('node')}`,
        defaultValue: code('node => node'),
        description: `Used for normalizing source data. See ${link('#customize-key-names')} for detailed information.`,
      }, {
        name: 'openDirection',
        type: 'String',
        defaultValue: code('"auto"'),
        description: `By default (${code('"auto"')}), the menu will open below the control. If there is not enough space, vue-treeselect will automatically flip the menu. You can use one of other four options to force the menu to be always opened to specified direction. <br>Acceptable values: ${code('"auto"')}, ${code('"below"')}, ${code('"bottom"')}, ${code('"above"')} or ${code('"top"')}.`,
      }, {
        name: 'openOnClick',
        type: 'Boolean',
        defaultValue: code('true'),
        description: `Whether to automatically open the menu when the control is clicked.`,
      }, {
        name: 'openOnFocus',
        type: 'Boolean',
        defaultValue: code('false'),
        description: `Whether to automatically open the menu when the control is focused.`,
      }, {
        name: 'options',
        type: code('node[]'),
        defaultValue: NO_DEFAULT_VALUE,
        description: `Array of available options. See ${link('#basic-features')} to learn how to define them.`,
      }, {
        name: 'placeholder',
        type: 'String',
        defaultValue: code('"Select..."'),
        description: "Field placeholder, displayed when there's no value.",
      }, {
        name: 'required',
        type: 'Boolean',
        defaultValue: code('false'),
        description: `Applies HTML5 ${code('required')} attribute when needed.`,
      }, {
        name: 'retryText',
        type: 'String',
        defaultValue: code('"Retry?"'),
        description: 'Text displayed asking user whether to retry loading children options.',
      }, {
        name: 'retryTitle',
        type: 'String',
        defaultValue: code('"Click to retry"'),
        description: 'Title for the retry button.',
      }, {
        name: 'searchable',
        type: 'Boolean',
        defaultValue: code('true'),
        description: 'Whether to enable searching feature or not.',
      }, {
        name: 'searchNested',
        type: 'Boolean',
        defaultValue: code('false'),
        description: `Set ${code('true')} if the search query should search in all ancestor nodes too. See ${link('#nested-search')} for example.`,
      }, {
        name: 'searchPromptText',
        type: 'String',
        defaultValue: code('"Type to search..."'),
        description: `Text tip to prompt for async search. Used for ${link('#async-searching', 'async search mode')}.`,
      }, {
        name: 'showCount',
        type: 'Boolean',
        defaultValue: code('false'),
        description: `Whether to show a children count next to the label of each branch node. See ${link('#disable-branch-nodes')} for example.`,
      }, {
        name: 'showCountOf',
        type: 'String',
        defaultValue: code('"ALL_CHILDREN"'),
        description: `Used in conjunction with ${code('showCount')} to specify which type of count number should be displayed. <br>Acceptable values: ${code('"ALL_CHILDREN"')}, ${code('"ALL_DESCENDANTS"')}, ${code('"LEAF_CHILDREN"')} or ${code('"LEAF_DESCENDANTS"')}.`,
      }, {
        name: 'showCountOnSearch',
        type: 'Boolean',
        defaultValue: NO_DEFAULT_VALUE,
        description: `Whether to show children count when searching. Fallbacks to the value of ${code('showCount')} when not specified.`,
      }, {
        name: 'sortValueBy',
        type: 'String',
        defaultValue: code('"ORDER_SELECTED"'),
        description: `In which order the selected options should be displayed in trigger & sorted in ${code('value')} array. Use only when ${code(':multiple="true"')}. See ${link('#flat-mode-and-sort-values')} for example. <br>Acceptable values: ${code('"ORDER_SELECTED"')}, ${code('"LEVEL"')} or ${code('"INDEX"')}.`,
      }, {
        name: 'tabIndex',
        type: 'Number',
        defaultValue: code('0'),
        description: 'Tab index of the control.',
      }, {
        name: 'value',
        type: `${code('id')} | ${code('node')} | ${code('id[]')} | ${code('node[]')}`,
        defaultValue: NO_DEFAULT_VALUE,
        description: `The value of the control. <br>Should be ${code('id')} or ${code('node')} object when ${code(':multiple="false"')}, or an array of ${code('id')} or ${code('node')} object when ${code(':multiple="true"')}. Its format depends on the ${code('valueFormat')} prop. <br>For most cases, just use ${code('v-model')} instead.`,
      }, {
        name: 'valueConsistsOf',
        type: 'String',
        defaultValue: code('"BRANCH_PRIORITY"'),
        description: `Which kind of nodes should be included in the ${code('value')} array in multi-select mode. See ${link('#prevent-value-combining')} for example. <br>Acceptable values: ${code('"ALL"')}, ${code('"BRANCH_PRIORITY"')}, ${code('"LEAF_PRIORITY"')} or ${code('"ALL_WITH_INDETERMINATE"')}.`,
      }, {
        name: 'valueFormat',
        type: 'String',
        defaultValue: code('"id"'),
        description: `Format of ${code('value')} prop. <br>Note that, when set to ${code('"object"')}, only ${code('id')} & ${code('label')} properties are required in each ${code('node')} object in ${code('value')}. <br>Acceptable values: ${code('"id"')} or ${code('"object"')}.`,
      }, {
        name: 'zIndex',
        type: 'Number | String',
        defaultValue: code('999'),
        description: `${(code('z-index'))} of the menu.`,
      } ],
    }),
  }
</script>
