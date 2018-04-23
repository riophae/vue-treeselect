const webpack = require('webpack')
const merge = require('webpack-merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeJsPlugin = require('optimize-js-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const config = require('../config')
const base = require('./webpack.base.conf')
const utils = require('./utils')
const banner = require('./banner')

base.entry = {
  VueTreeselect: './src/index.js',
}

const webpackConfig = merge(base, {
  output: {
    path: config.bundle.assetsRoot,
    publicPath: config.bundle.assetsPublicPath,
    filename: config.bundle.prod.jsFilename,
    library: config.bundle.library,
    libraryTarget: config.bundle.prod.libraryTarget,
  },
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.bundle.prod.productionSourceMap,
      usePostCSS: true,
      extract: true,
    }),
  },
  devtool: config.bundle.prod.productionSourceMap ? '#source-map' : false,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.bundle.prod.env,
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: { warnings: false },
      },
      sourceMap: config.bundle.prod.productionSourceMap,
      parallel: true,
    }),
    new OptimizeJsPlugin({
      sourceMap: config.bundle.prod.productionSourceMap,
    }),
    new ExtractTextPlugin({
      filename: config.bundle.prod.cssFilename,
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        reduceIdents: false,
        safe: true,
      },
    }),
    new webpack.BannerPlugin(banner),
  ],
})

if (config.bundle.bundleAnalyzerReport) {
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
