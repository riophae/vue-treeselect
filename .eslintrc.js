module.exports = {
  root: true,
  extends: [ 'riophae/vue' ],
  plugins: [ 'react' ],
  globals: {
    PKG_VERSION: true,
  },
  settings: {
    'import/resolver': {
      node: null,
      webpack: {
        config: 'build/webpack-configs/base.js',
      },
    },
  },
  rules: {
    'import/no-named-as-default': 0,
    'unicorn/consistent-function-scoping': 0,
    'vue/attributes-order': 0,
    'vue/no-v-html': 0,
    'no-confusing-arrow': 0,
    'no-console': 0,
    'no-warning-comments': 0,
    'no-undefined': 0,
    'prefer-destructuring': 0,
  },
  overrides: [ {
    files: [ 'src/**' ],
    rules: {
      'unicorn/no-for-loop': 0,
      'unicorn/prefer-includes': 0,
      'unicorn/prefer-node-append': 0,
    },
  } ],
}
