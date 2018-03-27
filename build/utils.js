const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const config = require('../config')

exports.assetsPath = function assetsPath(_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.docs.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function cssLoaders(options) {
  options = options || {}
  // generate loader string to be used with extract text plugin
  function generateLoaders(loaders) {
    const sourceLoader = loaders.map(loader => {
      let extraParamChar
      if (/\?/.test(loader)) {
        loader = loader.replace(/\?/, '-loader?')
        extraParamChar = '&'
      } else {
        loader = loader + '-loader'
        extraParamChar = '?'
      }
      return loader + (options.sourceMap ? extraParamChar + 'sourceMap' : '')
    }).join('!')

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: sourceLoader,
        fallback: 'vue-style-loader',
      })
    } else {
      return [ 'vue-style-loader', sourceLoader ].join('!')
    }
  }

  const baseLoaders = [ 'css', 'postcss' ]

  // http://vuejs.github.io/vue-loader/en/configurations/extract-css.html
  return {
    css: generateLoaders(baseLoaders),
    postcss: generateLoaders(baseLoaders),
    less: generateLoaders(baseLoaders.concat('less')),
    sass: generateLoaders(baseLoaders.concat('sass?indentedSyntax')),
    scss: generateLoaders(baseLoaders.concat('sass')),
    stylus: generateLoaders(baseLoaders.concat('stylus')),
    styl: generateLoaders(baseLoaders.concat('stylus')),
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function styleLoaders(options) {
  const loaders = exports.cssLoaders(options)
  return Object.keys(loaders).map(extension => ({
    test: new RegExp('\\.' + extension + '$'),
    loader: loaders[extension],
  }))
}
