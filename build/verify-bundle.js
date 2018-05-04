const fs = require('fs')
const path = require('path')
const shallowEqual = require('shallow-equal/arrays')
const config = require('../config')

const expectedDistFiles = [
  'vue-treeselect.js',
  'vue-treeselect.js.map',
  'vue-treeselect.css',
  'vue-treeselect.css.map',
  'vue-treeselect.min.js',
  'vue-treeselect.min.css',
]
const actualFiles = fs.readdirSync(config.bundle.assetsRoot)
if (!shallowEqual(expectedDistFiles.sort(), actualFiles.sort())) {
  throw new Error('Built files are not as expected.')
}

function shouldReplaceEnvOrNot(expected, fileName) {
  const source = fs.readFileSync(path.join(config.bundle.assetsRoot, fileName))
  const actual = source.indexOf('process.env.NODE_ENV') === -1
  if (expected !== actual) {
    throw new Error('The bundle file was not built correctly.')
  }
}
shouldReplaceEnvOrNot(true, 'vue-treeselect.min.js')
shouldReplaceEnvOrNot(false, 'vue-treeselect.js')
