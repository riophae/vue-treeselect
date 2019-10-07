// see http://vuejs-templates.github.io/webpack for documentation.
const path = require('path')

const dev = {
  env: require('./dev.env'),
  port: 8080,
  autoOpenBrowser: true,
  assetsSubDirectory: 'static',
  assetsPublicPath: '/',
  proxyTable: {},
  cssSourceMap: false,
  showEslintErrorsInOverlay: false,
}

const bundle = {
  assetsRoot: path.resolve(__dirname, '../dist'),
  assetsPublicPath: '/',
  assetsSubDirectory: '/',
  bundleAnalyzerReport: process.env.npm_config_report,
  library: 'VueTreeselect',
  prod: {
    jsFilename: 'vue-treeselect.%LibraryTarget%.min.js',
    cssFilename: 'vue-treeselect.min.css',
    env: require('./prod.env'),
    productionSourceMap: true,
  },
  dev: {
    jsFilename: 'vue-treeselect.%LibraryTarget%.js',
    cssFilename: 'vue-treeselect.css',
    env: null,
    productionSourceMap: true,
  },
}

const docs = {
  env: require('./prod.env'),
  output: path.resolve(__dirname, '../gh-pages/index.html'),
  baseHtmlWebpackPluginOptions: {
    template: path.resolve(__dirname, '../docs/index.pug'),
    templateParameters: { process },
  },
  assetsRoot: path.resolve(__dirname, '../gh-pages'),
  assetsPublicPath: '',
  assetsSubDirectory: 'static',
  productionSourceMap: false,
  bundleAnalyzerReport: process.env.npm_config_report,
}

module.exports = { dev, bundle, docs }
