module.exports = {
  extends: 'stylelint-config-xo-space',
  rules: {
    'string-quotes': [ 'double', { avoidEscape: false } ],
    'declaration-empty-line-before': null,
    'at-rule-empty-line-before': null,
    'selector-list-comma-newline-after': null,
    'rule-empty-line-before': null,
    'value-keyword-case': null, // [ 'lower', { ignoreProperties: [ 'font', 'font-family' ] } ],
    'declaration-block-no-duplicate-properties': [ true, { ignore: [ 'consecutive-duplicates' ] } ],
    'declaration-property-value-blacklist': null,
    'property-blacklist': null,
    'no-unknown-animations': null,
    'font-weight-notation': null,
    'no-descending-specificity': null,
    'selector-max-compound-selectors': null,
    // Stylelint v11 is buggy with this rule.
    'block-no-empty': null,
  },
}
