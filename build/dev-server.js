/* eslint-disable no-console */

const path = require('path')
const open = require('open')
const express = require('express')
const webpack = require('webpack')
const webpackConfig = require('./webpack-configs/docs/dev')
const config = require('./config')

// default port where dev server listens for incoming traffic
const port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
const autoOpenBrowser = !!config.dev.autoOpenBrowser

const app = express()
const compiler = webpack(webpackConfig)

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  stats: 'minimal',
})

const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => { /* empty */ },
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', compilation => {
  compilation.plugin('html-webpack-plugin-after-emit', () => {
    hotMiddleware.publish({ action: 'reload' })
  })
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
const staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

const uri = 'http://localhost:' + port

devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
})

module.exports = app.listen(port, err => {
  if (err) {
    console.log(err)
    return
  }

  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    open(uri)
  }
})
