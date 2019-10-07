process.env.NODE_ENV = 'production'

const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const shell = require('shelljs')
const ora = require('ora')
const chalk = require('chalk')
const runSeries = require('run-series')
const config = require('../config')

const assetsPath = path.join(config.bundle.assetsRoot, config.bundle.assetsSubDirectory)
const spinner = ora('Building bundle...\n\n')

const prepare = cb => {
  shell.rm('-rf', assetsPath)
  shell.mkdir('-p', assetsPath)
  cb()
}

const createVariants = webpackConfig => {
  const { filename } = webpackConfig.output
  const cjsBuildConfig = merge(webpackConfig, {
    output: {
      filename: filename.replace('%LibraryTarget%', 'cjs'),
      libraryTarget: 'commonjs2',
    },
    externals: [
      nodeExternals(),
    ],
  })
  const umdBuildConfig = merge(webpackConfig, {
    output: {
      filename: filename.replace('%LibraryTarget%', 'umd'),
      libraryTarget: 'umd',
    },
    externals: {
      vue: 'Vue',
    },
  })

  return [ cjsBuildConfig, umdBuildConfig ]
}

const build = webpackConfig => cb => {
  spinner.start()

  webpack(createVariants(webpackConfig), (err, stats) => {
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

runSeries([
  prepare,
  build(require('./webpack.bundle.dev.conf')),
  build(require('./webpack.bundle.prod.conf')),
], done)
