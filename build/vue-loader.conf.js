const config = require('../config')
const utils = require('./utils')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: isProduction
      ? config.docs.productionSourceMap
      : config.dev.cssSourceMap,
    extract: isProduction,
    usePostCSS: true,
  }),
}
