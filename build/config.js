const utils = require('./webpack-configs/utils')

const dev = {
  port: 8080,
  autoOpenBrowser: true,
  assetsSubDirectory: 'static',
  assetsPublicPath: '/',
}

const library = {
  assetsRoot: utils.resolve('dist'),
  assetsPublicPath: '/',
  assetsSubDirectory: '/',
  bundleAnalyzerReport: process.env.npm_config_report,
  libraryTargetPlaceholder: '[LIBRARY_TARGET]',
}

const docs = {
  assetsRoot: utils.resolve('gh-pages'),
  assetsPublicPath: '',
  assetsSubDirectory: 'static',
  bundleAnalyzerReport: process.env.npm_config_report,
}

module.exports = { dev, library, docs }
