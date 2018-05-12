// This is the webpack config used for unit tests.

const webpack = require('webpack')
const merge = require('webpack-merge')
const utils = require('./utils')
const baseConfig = require('./webpack.base.conf')

const webpackConfig = merge(baseConfig, {
  mode: 'development',
  module: {
    rules: [
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
