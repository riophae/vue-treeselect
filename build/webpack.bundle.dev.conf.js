const webpack = require('webpack')
const merge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeJsPlugin = require('optimize-js-plugin')
const config = require('../config')
const base = require('./webpack.base.conf')
const utils = require('./utils')
const banner = require('./banner')

base.entry = {
  VueTreeselect: './src/index.js',
}

const webpackConfig = merge(base, {
  mode: 'none',
  output: {
    path: config.bundle.assetsRoot,
    publicPath: config.bundle.assetsPublicPath,
    filename: config.bundle.dev.jsFilename,
    library: config.bundle.library,
    libraryTarget: config.bundle.dev.libraryTarget,
  },
  module: {
    rules: [
      utils.styleLoaders({
        sourceMap: config.bundle.dev.productionSourceMap,
        extract: true,
      }),
    ],
  },
  externals: [ nodeExternals() ],
  devtool: config.bundle.dev.productionSourceMap ? 'source-map' : false,
  plugins: [
    new MiniCssExtractPlugin({
      filename: config.bundle.dev.cssFilename,
      chunkFilename: '[id].css',
    }),
    new webpack.BannerPlugin(banner),
  ],
  optimization: {
    nodeEnv: false,
    noEmitOnErrors: true,
    flagIncludedChunks: true,
    minimizer: [
      new OptimizeJsPlugin({
        sourceMap: config.bundle.dev.productionSourceMap,
      }),
    ],
  },
})

if (config.bundle.bundleAnalyzerReport) {
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
