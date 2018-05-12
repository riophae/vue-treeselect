// see http://vuejs-templates.github.io/webpack for documentation.
const path = require('path')

const createCssProcessor = sourceMap => require('cssnano')({
  safe: true,
  autoprefixer: { disable: true },
  map: !!sourceMap,
})

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
    cssProcessor: createCssProcessor(false),
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
  index: path.resolve(__dirname, '../gh-pages/index.html'),
  assetsRoot: path.resolve(__dirname, '../gh-pages'),
  assetsPublicPath: '',
  assetsSubDirectory: 'static',
  productionSourceMap: false,
  cssProcessor: createCssProcessor(false),
  bundleAnalyzerReport: process.env.npm_config_report,
}

module.exports = { dev, bundle, docs }
