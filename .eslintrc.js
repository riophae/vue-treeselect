module.exports = {
  root: true,
  env: {
    browser: true,
  },
  parserOptions: {
    parser: "@babel/eslint-parser",
    requireConfigFile: false,
    ecmaVersion: 8,
    sourceType: "module",
  },
  plugins: ["prettier"],
  extends: ["plugin:vue/recommended", "plugin:prettier/recommended"],
  rules: {
    "comma-dangle": "off",
    "vue/no-reserved-keys": "off",
    "class-methods-use-this": "off",
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "implicit-arrow-linebreak": "off",
    "import/prefer-default-export": "off",
    "vue/component-name-in-template-casing": [
      "error",
      "kebab-case",
      {
        ignores: [],
      },
    ],
    "prettier/prettier": "error",
  },
};
