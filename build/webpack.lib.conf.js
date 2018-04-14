const webpack = require('webpack')
const merge = require('webpack-merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const config = require('../config')
const base = require('./webpack.base.conf')
const utils = require('./utils')

const env = process.env.NODE_ENV === 'testing'
  ? require('../config/test.env')
  : config.lib.env

base.entry = {
  VueTreeselect: './src/index.js',
}

const webpackConfig = merge(base, {
  output: {
    path: config.lib.assetsRoot,
    publicPath: config.lib.assetsPublicPath,
    filename: 'vue-treeselect.js',
    library: 'VueTreeselect',
    libraryTarget: 'umd',
  },
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.lib.productionSourceMap,
      extract: true,
      usePostCSS: true,
    }),
  },
  devtool: config.lib.productionSourceMap ? '#source-map' : false,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': env,
    }),
    new ExtractTextPlugin({
      filename: 'vue-treeselect.css',
    }),
  ],
})

if (config.lib.bundleAnalyzerReport) {
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
