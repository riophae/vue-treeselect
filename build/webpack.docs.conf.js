const path = require('path')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeJsPlugin = require('optimize-js-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const config = require('../config')
const utils = require('./utils')
const baseWebpackConfig = require('./webpack.base.conf')

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  output: {
    path: config.docs.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js'),
  },
  module: {
    rules: [
      utils.styleLoaders({
        ext: 'less',
        usePostCSS: true,
        sourceMap: config.docs.productionSourceMap,
        extract: true,
      }),
    ],
  },
  devtool: config.docs.productionSourceMap ? '#source-map' : false,
  plugins: [
    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      chunkFilename: '[id].css',
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: config.docs.index,
      template: 'docs/index.pug',
      minify: {
        caseSensitive: true,
        removeComments: false,
        collapseWhitespace: false,
        removeAttributeQuotes: false,
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency',
    }),
    new CopyWebpackPlugin([ {
      from: path.join(__dirname, '../static'),
      to: path.join(__dirname, '../gh-pages/static'),
    }, {
      from: path.join(__dirname, '../docs/CNAME'),
      to: path.join(__dirname, '../gh-pages'),
    }, {
      from: path.join(__dirname, '../docs/browserconfig.xml'),
      to: path.join(__dirname, '../gh-pages'),
    }, {
      from: path.join(__dirname, '../.circleci'),
      to: path.join(__dirname, '../gh-pages/.circleci'),
    } ]),
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: { warnings: false },
        },
        parallel: true,
        sourceMap: config.bundle.productionSourceMap,
      }),
      new OptimizeJsPlugin({ sourceMap: config.bundle.productionSourceMap }),
      new OptimizeCSSPlugin(),
    ],
  },
})

if (config.docs.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
