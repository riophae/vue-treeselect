const webpack = require('webpack')
const merge = require('webpack-merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeJsPlugin = require('optimize-js-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const config = require('../config')
const base = require('./webpack.base.conf')
const utils = require('./utils')
const version = require('../package').version

const env = process.env.NODE_ENV === 'testing'
  ? require('../config/test.env')
  : config.bundle.env

base.entry = {
  VueTreeselect: './src/index.js',
}

const banner = `
vue-treeselect v${version} | (c) 2017-2018 Riophae Lee
Released under the MIT License.
https://github.com/riophae/vue-treeselect
`.trim()

const webpackConfig = merge(base, {
  output: {
    path: config.bundle.assetsRoot,
    publicPath: config.bundle.assetsPublicPath,
    filename: 'vue-treeselect.min.js',
    library: 'VueTreeselect',
    libraryTarget: 'umd',
  },
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.bundle.productionSourceMap,
      extract: true,
    }),
  },
  devtool: config.bundle.productionSourceMap ? '#source-map' : false,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': env,
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
    }),
    new OptimizeJsPlugin({ sourceMap: false }),
    new ExtractTextPlugin({
      filename: 'vue-treeselect.min.css',
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        reduceIdents: false,
      },
    }),
    new webpack.BannerPlugin(banner),
  ],
})

module.exports = webpackConfig
