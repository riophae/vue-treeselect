const merge = require('webpack-merge')
const utils = require('../utils')
const baseWebpackConfig = require('../base')

process.env.NODE_ENV = 'testing'

module.exports = merge(baseWebpackConfig, {
  mode: 'development',

  module: {
    rules: [
      utils.eslintLoader('test'),
      utils.styleLoaders(),
    ],
  },

  devtool: false,

  optimization: {
    nodeEnv: process.env.NODE_ENV,
  },
})
