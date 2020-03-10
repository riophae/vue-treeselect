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

function readFile(fileName) {
  return fs.readFileSync(path.join(config.bundle.assetsRoot, fileName))
}

function shouldReplaceEnvOrNot(expected, fileName) {
  const source = readFile(fileName)
  const actual = !source.includes('process.env.NODE_ENV')
  if (expected !== actual) {
    throw new Error('The bundle file was not built correctly.')
  }
}
shouldReplaceEnvOrNot(false, 'vue-treeselect.js')
shouldReplaceEnvOrNot(true, 'vue-treeselect.min.js')

function shouldReplaceCssEasings(fileName) {
  const source = readFile(fileName)
  if (!source.includes('cubic-bezier(')) {
    throw new Error('The bundle file was not built correctly.')
  }
}
shouldReplaceCssEasings('vue-treeselect.css')
shouldReplaceCssEasings('vue-treeselect.min.css')
