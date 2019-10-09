/* eslint-disable no-console */

const path = require('path')
const webpack = require('webpack')
const shell = require('shelljs')
const ora = require('ora')
const chalk = require('chalk')
const runSeries = require('run-series')
const config = require('./config')
const webpackConfig = require('./webpack-configs/docs/prod')

const assetsPath = path.join(config.docs.assetsRoot, config.docs.assetsSubDirectory)
const spinner = ora('Building docs...')

const prepare = cb => {
  shell.rm('-rf', assetsPath)
  shell.mkdir('-p', assetsPath)
  shell.config.silent = true
  shell.cp('-R', 'static/*', assetsPath)
  shell.config.silent = false
  cb()
}

const build = cb => {
  spinner.start()

  webpack(webpackConfig, (err, stats) => {
    spinner.stop()

    if (err) {
      cb(err)
    } else {
      process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
      }) + '\n\n')
      cb()
    }
  })
}

const done = err => {
  if (err) {
    throw err
  } else {
    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n',
    ))
  }
}

runSeries([ prepare, build ], done)
