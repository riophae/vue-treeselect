# vue-treeselect
[![npm](https://img.shields.io/npm/v/@riophae/vue-treeselect.svg)](https://www.npmjs.com/package/@riophae/vue-treeselect) [![CircleCI](https://img.shields.io/circleci/project/github/riophae/vue-treeselect/dev.svg)](https://circleci.com/gh/riophae/vue-treeselect/tree/dev) [![Codecov](https://codecov.io/gh/riophae/vue-treeselect/branch/dev/graph/badge.svg)](https://codecov.io/gh/riophae/vue-treeselect?branch=dev)

> A multi-select component with nested options for Vue.js

![Vue-Treeselect Screenshot](https://raw.githubusercontent.com/riophae/vue-treeselect/master/screenshot.png)

### Features

- Single select
- Multiple select
- Fuzzy searching
- Delayed loading (load data of deep level options only when needed)
- Keyboard support
- Vuex support
- Rich options & highly customizable
- Supports a wide range of browsers (see [below](#browser-compatibility))

*Requires Vue 2.2+*

### Getting Started

It's recommended to install vue-treeselect from npm, and build your app using a bundler like [webpack](https://webpack.js.org/).

```bash
npm install --save @riophae/vue-treeselect
```

This example shows how to integrate vue-treeselect with your [Vue SFCs](https://vuejs.org/v2/guide/single-file-components.html).

```html
<!-- Vue SFC -->
<template>
  <div id="app">
    <treeselect v-model="value" :multiple="true" :options="options" />
  </div>
</template>

<script>
  // import the component
  import Treeselect from '@riophae/vue-treeselect'
  // import the styles
  import '@riophae/vue-treeselect/dist/vue-treeselect.css'

  export default {
    // register the component
    components: { Treeselect },
    data() {
      return {
        // define default value
        value: null,
        // define options
        options: [ {
          id: 'a',
          label: 'a',
          children: [ {
            id: 'aa',
            label: 'aa',
          }, {
            id: 'ab',
            label: 'ab',
          } ],
        }, {
          id: 'b',
          label: 'b',
        }, {
          id: 'c',
          label: 'c',
        } ],
      }
    },
  }
</script>
```

If you just don't want to use webpack or other bundlers, you can also simply include the standalone UMD build in your page. In this way, you need to make sure Vue is included before vue-treeselect.

```html
<html>
  <head>
    <!-- include Vue 2.x -->
    <script src="https://cdn.jsdelivr.net/npm/vue@^2"></script>
    <!-- include vue-treeselect & its styles. you can change the version tag to better suit your need. -->
    <script src="https://cdn.jsdelivr.net/npm/@riophae/vue-treeselect@0.0.24/dist/vue-treeselect.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@riophae/vue-treeselect@0.0.24/dist/vue-treeselect.min.css">
  </head>
  <body>
    <div id="app">
      <treeselect v-model="value" :multiple="true" :options="options" />
    </div>
  </body>
  <script>
    // register the component
    Vue.component('treeselect', VueTreeselect.Treeselect)

    new Vue({
      el: '#app',
      data: {
        // define default value
        value: null,
        // define options
        options: [ {
          id: 'a',
          label: 'a',
          children: [ {
            id: 'aa',
            label: 'aa',
          }, {
            id: 'ab',
            label: 'ab',
          } ],
        }, {
          id: 'b',
          label: 'b',
        }, {
          id: 'c',
          label: 'c',
        } ],
      },
    })
  </script>
</html>
```

### Documentation & Live Demo

[Visit the website](https://vue-treeselect.js.org/)

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
6. Push your changes & file a pull request to `dev` branch

### Credits

This project is inspired by [vue-multiselect](https://github.com/monterail/vue-multiselect), [react-select](https://github.com/JedWatson/react-select) and [Ant Design](https://github.com/ant-design/ant-design/). Special thanks go to their respective authors!

Some icons used in this project:

  - "anchor" icon made by [Smashicons](https://www.flaticon.com/authors/smashicons) is licensed under [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/)
  - "spinner" icon from [SpinKit](https://github.com/tobiasahlin/SpinKit) is licensed under the [MIT License](https://github.com/tobiasahlin/SpinKit/blob/master/LICENSE)
  - "caret" icon made by [Dave Gandy](https://www.flaticon.com/authors/dave-gandy) is licensed under [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/)
  - "x" icon made by [Freepik](http://www.freepik.com) is licensed under [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/)
  - "x" icon (thin) made by [Egor Rumyantsev](https://www.flaticon.com/authors/egor-rumyantsev) is licensed under [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/)
  - "check mark" & "minus mark" icons made by [Catalin Fertu](https://www.flaticon.com/authors/catalin-fertu) is licensed under [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/)

### License

Copyright (c) 2017-present [Riophae Lee](https://github.com/riophae).

Released under the [MIT License](https://github.com/riophae/vue-treeselect/blob/master/LICENSE).
