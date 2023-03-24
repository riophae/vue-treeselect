const path = require('path')
const webpack = require('webpack')
const shell = require('shelljs')
const ora = require('ora')
const chalk = require('chalk')
const runSeries = require('run-series')
const config = require('./config')
const webpackConfigs = require('./webpack-configs/library')

const assetsPath = path.join(config.library.assetsRoot, config.library.assetsSubDirectory)
const spinner = ora('Building library...')

const prepare = cb => {
  shell.rm('-rf', assetsPath)
  shell.mkdir('-p', assetsPath)
  cb()
}

const build = cb => {
  spinner.start()

  webpack(webpackConfigs, (err, stats) => {
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
    // eslint-disable-next-line no-console
    console.log(chalk.cyan('  Build complete.\n'))
  }
}

runSeries([ prepare, build ], done)
