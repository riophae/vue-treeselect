const webpackConfig = require('../../build/webpack.test.conf')

module.exports = config => {
  config.set({
    browsers: [ 'PhantomJS', 'ChromeHeadless' ],
    frameworks: [ 'jasmine', 'jasmine-matchers', 'phantomjs-shim' ],
    reporters: [ 'spec', 'coverage' ],
    files: [ './index.js' ],
    preprocessors: {
      './index.js': [ 'webpack', 'sourcemap' ],
      '../../src/**/*.js': [ 'coverage' ],
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true,
    },
    coverageReporter: {
      dir: './coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' },
      ],
    },
  })
}
