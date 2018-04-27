const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const config = require('../config')

exports.assetsPath = _path => {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.docs.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

exports.styleLoaders = options => {
  const loaders = [ {
    loader: 'css-loader',
    options: {
      importLoaders: 1,
      sourceMap: options.sourceMap,
    },
  } ]

  if (options.usePostCSS) {
    loaders.push({
      loader: 'postcss-loader',
      options: {
        sourceMap: options.sourceMap,
      },
    })
  }

  loaders.push({
    loader: `${options.ext}-loader`,
    options: {
      sourceMap: options.sourceMap,
    },
  })

  if (options.extract) {
    loaders.unshift(MiniCssExtractPlugin.loader)
  } else {
    loaders.unshift('vue-style-loader')
  }

  return {
    test: new RegExp(`\\.${options.ext}$`),
    use: loaders,
  }
}
