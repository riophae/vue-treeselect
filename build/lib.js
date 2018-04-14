process.env.NODE_ENV = 'development'

const path = require('path')
const ora = require('ora')
const chalk = require('chalk')
const shell = require('shelljs')
const webpack = require('webpack')
const config = require('../config')
const webpackConfig = require('./webpack.lib.conf')

const spinner = ora('building lib...')
spinner.start()

const assetsPath = path.join(config.lib.assetsRoot, config.lib.assetsSubDirectory)
shell.rm('-rf', assetsPath)
shell.mkdir('-p', assetsPath)

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

  console.log(chalk.cyan('  Build complete.\n'))
})
