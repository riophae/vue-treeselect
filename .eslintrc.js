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
        config: 'build/webpack.base.conf.js',
      },
    },
  },
  rules: {
    'import/no-named-as-default': 0,
    'import/no-extraneous-dependencies': 0,
    'react/jsx-uses-vars': 2,
    'vue/attributes-order': 0,
    'vue/no-v-html': 0,
    'no-confusing-arrow': 0,
    'no-console': 0,
    'no-extra-parens': 0,
    'no-warning-comments': 0,
    'no-undefined': 0,
    'prefer-destructuring': 0,
  },
}
