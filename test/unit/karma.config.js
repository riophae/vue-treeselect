process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = config => {
  config.set({
    files: [ './index.js' ],
    browsers: [ 'ChromeHeadlessWithoutSandbox' ],
    customLaunchers: {
      ChromeHeadlessWithoutSandbox: {
        // `ChromeHeadless` without any flags used to be working
        // well, but it is not now for some unknown reason.
        // Adding `--no-sandbox` flag solves the issue, which
        // I know is insecure. But since we are only using
        // Chrome to run the tests, it should be just fine.
        base: 'ChromeHeadless',
        flags: [ '--no-sandbox' ],
      },
    },
    preprocessors: {
      './index.js': [ 'webpack', 'sourcemap' ],
    },
    webpack: require('../../build/webpack-configs/test'),
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
