module.exports = {
  root: true,
  extends: [ 'eslint-config-riophae/vue' ],
  rules: {
    indent: 0, // not working well with .vue files so disable it
    'prefer-destructuring': 0,
    'no-warning-comments': 0,
    'no-undefined': 0,
    'no-extra-parens': 0,
    'import/no-named-as-default': 0,
  },
}
