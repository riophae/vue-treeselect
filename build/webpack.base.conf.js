const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const config = require('../config')
const utils = require('./utils')

module.exports = {
  entry: {
    app: './docs/main.js',
  },
  output: {
    path: config.docs.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.docs.assetsPublicPath
      : config.dev.assetsPublicPath,
  },
  resolve: {
    extensions: [ '.js', '.vue', '.json' ],
    alias: {
      // use the development version & full build of Vue
      // see: https://vuejs.org/v2/guide/installation.html#Explanation-of-Different-Builds
      'vue$': 'vue/dist/vue',
      // for consistent docs
      '@riophae/vue-treeselect': utils.resolve('src'),
      // for shorter import path in tests
      '@src': utils.resolve('src'),
    },
  },
  module: {
    rules: [
      utils.withCacheLoader({
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            preserveWhitespace: false,
          },
        },
      }),
      utils.withCacheLoader({
        test: /\.js$/,
        loader: 'babel-loader',
        include: [ 'src', 'docs', 'test' ].map(utils.resolve),
      }, {
        disableCacheInTest: true,
      }),
      utils.withCacheLoader({
        test: /\.pug$/,
        loader: 'pug-loader',
        options: {
          pretty: true,
        },
      }),
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
        },
      },
    ],
  },
  optimization: {
    concatenateModules: true,
  },
  node: {
    process: false,
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      PKG_VERSION: JSON.stringify(require('../package').version),
    }),
  ],
}
