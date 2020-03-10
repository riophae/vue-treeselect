/* eslint-disable no-console */

process.env.NODE_ENV = 'production'

const path = require('path')
const ora = require('ora')
const chalk = require('chalk')
const shell = require('shelljs')
const webpack = require('webpack')
const config = require('../config')
const webpackConfigProd = require('./webpack.bundle.prod.conf')
const webpackConfigDev = require('./webpack.bundle.dev.conf')

const assetsPath = path.join(config.bundle.assetsRoot, config.bundle.assetsSubDirectory)
shell.rm('-rf', assetsPath)
shell.mkdir('-p', assetsPath)

function build(webpackConfig, cb) {
  const spinner = ora('building bundle...')
  spinner.start()

  webpack(webpackConfig, (err, stats) => {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
    }) + '\n\n')

    cb()
  })
}

build(webpackConfigDev, () => {
  build(webpackConfigProd, () => {
    console.log(chalk.cyan('  Build complete.\n'))
  })
})
