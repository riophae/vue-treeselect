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
    jsFilename: 'vue-treeselect.min.js',
    cssFilename: 'vue-treeselect.min.css',
    libraryTarget: 'umd',
    env: require('./prod.env'),
    productionSourceMap: false,
  },
  dev: {
    jsFilename: 'vue-treeselect.js',
    cssFilename: 'vue-treeselect.css',
    libraryTarget: 'commonjs2',
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
