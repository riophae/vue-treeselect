// see http://vuejs-templates.github.io/webpack for documentation.
const path = require('path')

module.exports = {
  dev: {
    env: require('./dev.env'),
    port: 8080,
    autoOpenBrowser: true,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {},
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false,
    showEslintErrorsInOverlay: false,
  },
  bundle: {
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
  },
  docs: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../gh-pages/index.html'),
    assetsRoot: path.resolve(__dirname, '../gh-pages'),
    assetsPublicPath: '',
    assetsSubDirectory: 'static',
    productionSourceMap: false,
    bundleAnalyzerReport: process.env.npm_config_report,
  },
}
