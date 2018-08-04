// This is the webpack config used for unit tests.

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(require('../config/test.env').NODE_ENV)
}

const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.base.conf')
const utils = require('./utils')

const webpackConfig = merge(baseConfig, {
  mode: 'development',
  module: {
    rules: [
      utils.eslintLoader('test'),
      utils.styleLoaders(),
    ],
  },
  // use inline sourcemap for karma-sourcemap-loader
  devtool: '#inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/test.env'),
    }),
  ],
})

// no need for app entry during tests
delete webpackConfig.entry

module.exports = webpackConfig
