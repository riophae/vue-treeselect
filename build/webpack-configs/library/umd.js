const merge = require('webpack-merge')
const { libraryTargetPlaceholder } = require('../../config').library

module.exports = webpackConfig => merge(webpackConfig, {
  output: {
    filename: webpackConfig.output.filename.replace(libraryTargetPlaceholder, 'umd'),
    libraryTarget: 'umd',
  },

  externals: {
    vue: 'Vue',
  },
})
