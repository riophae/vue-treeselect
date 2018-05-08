const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const config = require('../config')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

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
    modules: [
      resolve('src'),
      resolve('docs'),
      resolve('node_modules'),
    ],
    alias: {
      vue$: 'vue/dist/vue',
      '@riophae/vue-treeselect': resolve('src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [ resolve('src'), resolve('test') ],
        options: {
          formatter: require('eslint-friendly-formatter'),
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [ resolve('src'), resolve('docs'), resolve('test') ],
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader',
        include: [ resolve('src'), resolve('docs') ],
        options: {
          pretty: true,
        },
      },
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
  plugins: [
    new VueLoaderPlugin(),
  ],
}
