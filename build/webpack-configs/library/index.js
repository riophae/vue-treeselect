const merge = require('webpack-merge')
const baseWebpackConfig = require('./base')
const dev = require('./dev')
const prod = require('./prod')
const umd = require('./umd')
const cjs = require('./cjs')

const ENV_UNSET = false
const ENV_DEVELOPMENT = 'development'
const ENV_PRODUCTION = 'production'

const setNodeEnv = (webpackConfig, nodeEnv) => merge(webpackConfig, {
  optimization: {
    nodeEnv,
  },
})

module.exports = [
  cjs(dev(setNodeEnv(baseWebpackConfig, ENV_UNSET))),
  umd(dev(setNodeEnv(baseWebpackConfig, ENV_DEVELOPMENT))),
  cjs(prod(setNodeEnv(baseWebpackConfig, ENV_PRODUCTION))),
  umd(prod(setNodeEnv(baseWebpackConfig, ENV_PRODUCTION))),
]
