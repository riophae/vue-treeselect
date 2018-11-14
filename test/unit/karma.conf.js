const webpackConfig = require('../../build/webpack.test.conf')

module.exports = config => {
  config.set({
    files: [ './index.js' ],
    browsers: [ 'CustomChrome' ],
    customLaunchers: {
      CustomChrome: {
        // `ChromeHeadless` without any flags used to be fine,
        // but it is not now for some unknown reason.
        // Adding `--no-sandbox` flag solves the issue, which
        // I know is insecure. But since we are only running
        // tests, there would be no problem.
        base: 'ChromeHeadless',
        flags: [ '--no-sandbox' ],
      },
    },
    preprocessors: {
      './index.js': [ 'webpack', 'sourcemap' ],
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true,
    },
    frameworks: [ 'jasmine', 'jasmine-matchers' ],
    client: {
      jasmine: { random: false },
    },
    reporters: [ 'spec', 'coverage' ],
    coverageReporter: {
      dir: './coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' },
      ],
    },
  })
}
