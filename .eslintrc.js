module.exports = {
  root: true,
  extends: [ 'eslint-config-riophae/vue' ],
  settings: {
    'import/resolver': {
      node: null,
      webpack: {
        config: 'build/webpack.base.conf.js',
      },
    },
  },
  rules: {
    indent: 0, // not working well with .vue files so disable it
    'prefer-destructuring': 0,
    'no-warning-comments': 0,
    'no-undefined': 0,
    'no-extra-parens': 0,
    'import/no-named-as-default': 0,
    'import/no-extraneous-dependencies': 0,
  },
}
