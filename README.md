# vue-treeselect
[![npm](https://img.shields.io/npm/v/@riophae/vue-treeselect.svg)](https://www.npmjs.com/package/@riophae/vue-treeselect) [![CircleCI](https://img.shields.io/circleci/project/github/riophae/vue-treeselect/dev.svg)](https://circleci.com/gh/riophae/vue-treeselect/tree/dev) [![Codecov](https://codecov.io/gh/riophae/vue-treeselect/branch/dev/graph/badge.svg)](https://codecov.io/gh/riophae/vue-treeselect?branch=dev)

> A multi-select component with nested options for Vue.js

![Vue-Treeselect Screenshot](https://raw.githubusercontent.com/riophae/vue-treeselect/master/screenshot.png)

### Features

- Single select
- Multiple select
- Autocomplete
- Fuzzy searching
- Delayed loading (load data of deep level options only when needed)
- Keyboard support
- Vuex support
- Rich options & highly customizable
- Supports a wide range of browsers (see [below](#browser-compatibility))
- \> 95% test coverage

*Requires Vue 2.2+*

### Installation

**Install vue-treeselect using npm:**

```shell
$ npm install --save @riophae/vue-treeselect
```

**Or via yarn:**

```shell
$ yarn add @riophae/vue-treeselect
```

**Or via CDN:**

```html
<script src="https://unpkg.com/@riophae/vue-treeselect@^0.1.0"></script>
<link rel="stylesheet" href="https://unpkg.com/@riophae/vue-treeselect@^0.1.0?main=css">
```

The library will be exposed as `window.VueTreeselect.Treeselect`. Note that, Vue as a dependency should be included before vue-treeselect.

### Basic Usage

```html
<!-- Vue component -->
<template>
  <treeselect
    v-model="value"
    :multiple="true"
    :options="source"
    />
</template>

<script>
  import Treeselect from '@riophae/vue-treeselect'

  export default {
    components: { Treeselect },
    data: {
      value: null,
      source: [
        {
          id: 'node-1',
          label: 'Node 1',
          children: [
            {
              id: 'node-1-a',
              label: 'Node 1-A',
            },
            ...
          ],
        },
        {
          id: 'node-2',
          label: 'Node 2',
        },
        ...
      ],
    },
  }
</script>

<style src="@riophae/vue-treeselect/dist/vue-treeselect.min.css"></style>
```

### Documentation & Live Demo

[Visit the website](https://riophae.github.io/vue-treeselect)

Note: please use a desktop browser since the website hasn't been optimized for mobile devices.

### Browser Compatibility

- Chrome
- Edge
- Firefox
- IE ≥ 9
- Safari

It should function well on IE9, but the style can be slightly broken due to the lack of support of some relatively new CSS features, such as `transition` and `animation`. Nevertheless it should look 90% same as on modern browsers.

### Bugs

You can use this [pen](https://codepen.io/riophae/pen/MExgzP) to reproduce bugs and then [open an issue](https://github.com/riophae/vue-treeselect/issues/new).

### Contributing

1. Fork & clone the repo
2. Install dependencies by `yarn` or `npm install`
3. Check out a new branch **from `dev`**
4. `npm run dev` & hack
5. Make sure `npm test` passes
6. Push your changes & create a pull request to `dev`

### Credits

This project is inspired by [vue-multiselect](https://github.com/monterail/vue-multiselect), [react-select](https://github.com/JedWatson/react-select) and [Ant Design](https://github.com/ant-design/ant-design/). Special thanks go to their respective authors!

Some icons used in this project:

  - "anchor" icon made by [Smashicons](https://www.flaticon.com/authors/smashicons) is licensed under [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/)
  - "spinner" icon from [SpinKit](https://github.com/tobiasahlin/SpinKit) is licensed under the [MIT License](https://github.com/tobiasahlin/SpinKit/blob/master/LICENSE)

### License

Copyright (c) 2017-2018 [Riophae Lee](https://github.com/riophae).

Released under the [MIT License](https://github.com/riophae/vue-treeselect/blob/master/LICENSE.md).
