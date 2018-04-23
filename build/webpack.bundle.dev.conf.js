const merge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const config = require('../config')
const base = require('./webpack.base.conf')
const utils = require('./utils')

base.entry = {
  VueTreeselect: './src/index.js',
}

const webpackConfig = merge(base, {
  output: {
    path: config.bundle.assetsRoot,
    publicPath: config.bundle.assetsPublicPath,
    filename: config.bundle.dev.jsFilename,
    library: config.bundle.library,
    libraryTarget: config.bundle.dev.libraryTarget,
  },
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.bundle.dev.productionSourceMap,
      usePostCSS: true,
      extract: true,
    }),
  },
  externals: [ nodeExternals() ],
  devtool: config.bundle.dev.productionSourceMap ? '#source-map' : false,
  plugins: [
    new ExtractTextPlugin({
      filename: config.bundle.dev.cssFilename,
    }),
  ],
})

if (config.bundle.bundleAnalyzerReport) {
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
