const webpack = require('webpack')
const merge = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeJsPlugin = require('optimize-js-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const config = require('../config')
const base = require('./webpack.base.conf')
const utils = require('./utils')
const banner = require('./banner')

base.entry = {
  VueTreeselect: './src/index.js',
}

const webpackConfig = merge(base, {
  mode: 'production',
  output: {
    path: config.bundle.assetsRoot,
    publicPath: config.bundle.assetsPublicPath,
    filename: config.bundle.prod.jsFilename,
    library: config.bundle.library,
    libraryTarget: config.bundle.prod.libraryTarget,
  },
  module: {
    rules: [
      utils.styleLoaders({
        sourceMap: config.bundle.prod.productionSourceMap,
        extract: true,
      }),
    ],
  },
  externals: {
    vue: 'Vue',
  },
  devtool: config.bundle.prod.productionSourceMap ? 'source-map' : false,
  plugins: [
    new MiniCssExtractPlugin({
      filename: config.bundle.prod.cssFilename,
      chunkFilename: '[id].css',
    }),
    new webpack.BannerPlugin(banner),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: config.bundle.prod.productionSourceMap,
        extractComments: false,
      }),
      new OptimizeJsPlugin({
        sourceMap: config.bundle.prod.productionSourceMap,
      }),
      new OptimizeCSSPlugin(),
    ],
  },
})

if (config.bundle.bundleAnalyzerReport) {
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
