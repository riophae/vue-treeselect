const merge = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const { libraryTargetPlaceholder } = require('../../config').library
const utils = require('../utils')

const ENABLE_SOURCE_MAP = true

module.exports = webpackConfig => merge(webpackConfig, {
  mode: 'production',

  output: {
    filename: `vue-treeselect.${libraryTargetPlaceholder}.min.js`,
  },

  module: {
    rules: [
      utils.styleLoaders({
        sourceMap: ENABLE_SOURCE_MAP,
        extract: true,
      }),
    ],
  },

  devtool: ENABLE_SOURCE_MAP ? 'source-map' : false,

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'vue-treeselect.min.css',
      chunkFilename: '[id].css',
    }),
  ],

  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: ENABLE_SOURCE_MAP,
        extractComments: false,
      }),
      new OptimizeCSSPlugin(),
    ],
  },
})
