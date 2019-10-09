const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const config = require('../../config')
const utils = require('../utils')

module.exports = merge(require('./base'), {
  mode: 'development',

  entry: {
    app: [
      utils.resolve('build/dev-client.js'),
      utils.resolve('docs/main.js'),
    ],
  },

  output: {
    publicPath: config.dev.assetsPublicPath,
    filename: '[name].js',
  },

  module: {
    rules: [
      utils.eslintLoader('src'),
      utils.styleLoaders({
        sourceMap: false,
      }),
    ],
  },

  // cheap-module-eval-source-map is faster for development
  devtool: 'cheap-module-eval-source-map',

  plugins: [
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      template: utils.resolve('docs/index.pug'),
      templateParameters: {
        NODE_ENV: 'development',
      },
    }),
    new FriendlyErrorsPlugin(),
  ],
})
