<template>
  <table class="striped">
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="prop in props" :key="prop[0]">
        <td><strong>{{ prop.name }}</strong></td>
        <td class="nowrap">{{ prop.type }}</td>
        <td v-html="prop.defaultValue" />
        <td v-html="prop.description" />
      </tr>
    </tbody>
  </table>
</template>

<script>
  /* eslint-disable no-template-curly-in-string */
  const NO_DEFAULT_VALUE = '–'
  const v = code => `<code>${code}</code>`
  const s = text => `<strong>${text}</strong>`
  const link = (target, text = 'here') => `<a href="${target}">${text}</a>`

  export default {
    data: () => ({
      props: [ {
        name: 'alwaysOpen',
        type: 'Boolean',
        defaultValue: v('false'),
        description: 'Whether the menu should be always open.',
      }, {
        name: 'autofocus',
        type: 'Boolean',
        defaultValue: v('false'),
        description: 'Autofocus the component on mount.',
      }, {
        name: 'autoLoadRootOptions',
        type: 'Boolean',
        defaultValue: v('true'),
        description: 'Automatically load root options on mount.',
      }, {
        name: 'backspaceRemoves',
        type: 'Boolean',
        defaultValue: v('true'),
        description: 'Whether pressing backspace removes the last item if there is no text input.',
      }, {
        name: 'branchNodesFirst',
        type: 'Boolean',
        defaultValue: v('false'),
        description: 'Show branch nodes before leaf nodes.',
      }, {
        name: 'clearable',
        type: 'Boolean',
        defaultValue: v('true'),
        description: 'Whether to show an "×" icon that resets value.',
      }, {
        name: 'clearAllText',
        type: 'String',
        defaultValue: v('"Clear all"'),
        description: `Title for the "×" icon when ${v(':multiple="true"')}.`,
      }, {
        name: 'clearOnSelect',
        type: 'Boolean',
        defaultValue: `Defaults to ${v('false')} when ${v(':multiple="true"')}; always ${v('true')} otherwise.`,
        description: `Whether to clear the search input after selecting an option. Use only when ${v(':multiple="true"')}. For single-select mode, it ${s('always')} clears the input after selecting regardless of the prop value.`,
      }, {
        name: 'clearValueText',
        type: 'String',
        defaultValue: v('"Clear value"'),
        description: 'Title for the "×" icon.',
      }, {
        name: 'closeOnSelect',
        type: 'Boolean',
        defaultValue: v('true'),
        description: `Whether to close the menu after selecting an option. Use only when ${v(':multiple="true"')}.`,
      }, {
        name: 'deleteRemoves',
        type: 'Boolean',
        defaultValue: v('true'),
        description: 'Whether pressing delete key removes the last item if there is no text input.',
      }, {
        name: 'disableBranchNodes',
        type: 'Boolean',
        defaultValue: v('false'),
        description: 'Whether to prevent branch nodes from being selected.',
      }, {
        name: 'disabled',
        type: 'Boolean',
        defaultValue: v('false'),
        description: 'Whether to disable the control or not.',
      }, {
        name: 'defaultExpandLevel',
        type: 'Number',
        defaultValue: v('0'),
        description: `How many levels of branch nodes should be automatically expanded when loaded. Set ${v(Infinity)} to make all branch nodes expanded by default.`,
      }, {
        name: 'escapeClearsValue',
        type: 'Boolean',
        defaultValue: v('true'),
        description: 'Whether escape clears the value when the menu is closed.',
      }, {
        name: 'flat',
        type: 'Boolean',
        defaultValue: v('false'),
        description: `Whether to enable flat mode or not. See ${link('#flat-mode-and-sort-values')} for detailed information.`,
      }, {
        name: 'id',
        type: 'String | Number',
        defaultValue: v('null'),
        description: 'Will be passed with all events as second param. Useful for identifying events origin.',
      }, {
        name: 'loadingText',
        type: 'String',
        defaultValue: v('"Loading..."'),
        description: 'Text displayed when a branch node is loading its children options.',
      }, {
        name: 'limit',
        type: 'Number',
        defaultValue: v('Infinity'),
        description: `Limit the display of selected options. The rest will be hidden within the ${v('limitText')} string.`,
      }, {
        name: 'limitText',
        type: 'Function',
        defaultValue: v('count => `and ${count} more`'),
        description: 'Function that processes the message shown when selected elements pass the defined limit.',
      }, {
        name: 'loadChildrenErrorText',
        type: 'Function',
        defaultValue: v('error => `Failed to load children options: ${error.message || String(error)}.`'),
        description: 'Function that processes error message shown when loading children options failed.',
      }, {
        name: 'loadChildrenOptions',
        type: 'Function',
        defaultValue: NO_DEFAULT_VALUE,
        description: `As the name suggests, it's used for dynamic loading options. See ${link('#delayed-loading')} for detailed information.`,
      }, {
        name: 'loadRootOptions',
        type: 'Function',
        defaultValue: NO_DEFAULT_VALUE,
        description: `Used for delayed loading root options. See ${link('#delayed-loading')} for detailed information.`,
      }, {
        name: 'maxHeight',
        type: 'Number',
        defaultValue: v('300'),
        description: `Sets ${v('maxHeight')} style value of the menu.`,
      }, {
        name: 'multiple',
        type: 'Boolean',
        defaultValue: v('false'),
        description: `Set ${v(true)} to allow selecting multiple options (a.k.a., multi-select mode).`,
      }, {
        name: 'noChildrenText',
        type: 'String',
        defaultValue: v('"No children available..."'),
        description: 'Text displayed when a branch node has no children options.',
      }, {
        name: 'noResultsText',
        type: 'String',
        defaultValue: v('"No results found..."'),
        description: 'Text displayed when there are no matching search results.',
      }, {
        name: 'noOptionsText',
        type: 'String',
        defaultValue: v('"No options available."'),
        description: 'Text displayed when there are no available options.',
      }, {
        name: 'openDirection',
        type: 'String',
        defaultValue: v('"auto"'),
        description: `By default the menu will open whereever there is more space once there is not enough space below to open at ${v('maxHeight')}. Use this prop to force the menu to always open in specified direction. Acceptable values: ${v('"below"')}, ${v('"bottom"')}, ${v('"above"')} or ${v('"top"')}.`,
      }, {
        name: 'openOnClick',
        type: 'Boolean',
        defaultValue: v(true),
        description: `Whether to automatically open the menu when the control is clicked`,
      }, {
        name: 'openOnFocus',
        type: 'Boolean',
        defaultValue: v(false),
        description: `Whether to automatically open the menu when the control is focused`,
      }, {
        name: 'options',
        type: 'Object[]',
        defaultValue: NO_DEFAULT_VALUE,
        description: `Array of available options. See ${link('#basic-features')} to learn how to define them.`,
      }, {
        name: 'placeholder',
        type: 'String',
        defaultValue: v('"Select..."'),
        description: "Field placeholder, displayed when there's no value.",
      }, {
        name: 'retainScrollPosition',
        type: 'Boolean',
        defaultValue: v('true'),
        description: 'Retain the scroll position on menu reopen.',
      }, {
        name: 'retryText',
        type: 'String',
        defaultValue: v('"Retry?"'),
        description: 'Text displayed asking user whether to retry loading children options.',
      }, {
        name: 'retryTitle',
        type: 'String',
        defaultValue: v('"Click to retry"'),
        description: 'Title for the retry button.',
      }, {
        name: 'searchable',
        type: 'Boolean',
        defaultValue: v('true'),
        description: 'Whether to enable searching feature or not.',
      }, {
        name: 'showCount',
        type: 'Boolean',
        defaultValue: v('false'),
        description: `Whether to show a children count next to the label of each branch node. See ${link('#disable-branch-nodes')} for example.`,
      }, {
        name: 'showCountOf',
        type: 'String',
        defaultValue: v('"ALL_CHILDREN"'),
        description: `Used in pairs with ${v('showCount')} specifying what count should be displayed. Acceptable values: ${v('"ALL_CHILDREN"')}, ${v('"ALL_DESCENDANTS"')}, ${v('"LEAF_CHILDREN"')} or ${v('"LEAF_DESCENDANTS"')}.`,
      }, {
        name: 'showCountOnSearch',
        type: 'Boolean',
        defaultValue: NO_DEFAULT_VALUE,
        description: `Whether to show children count when searching. Fallbacks to the value of ${v('showCount')} when not specified.`,
      }, {
        name: 'sortValueBy',
        type: 'String',
        defaultValue: v('"ORDER_SELECTED"'),
        description: `In which order the selected options should be displayed. Acceptable values: ${v('"ORDER_SELECTED"')}, ${v('"LEVEL"')} or ${v('"INDEX"')}. See ${link('#flat-mode-and-sort-values')} for example.`,
      }, {
        name: 'tabIndex',
        type: 'Number',
        defaultValue: v('0'),
        description: 'Tab index of the control.',
      }, {
        name: 'value',
        type: 'Array',
        defaultValue: NO_DEFAULT_VALUE,
        description: 'An array of node ids as the initial field value.',
      } ],
    }),
  }
</script>
