const { resolve } = require('path')
const { readdirSync, readFileSync, existsSync, writeFileSync } = require('fs')

/**
 *
 * @param {string} code
 */
function dealVueFile(code) {
  if (!code.includes('defineComponent')) {
    code = code.replace(/<script>/, "<script>\nimport { defineComponent } from 'vue'\n")
    code = code.replace(/export default ([\s\S]+?)<\/script>/, 'export default defineComponent($1)\n</script>')
  }

  return code
}


/**
 *
 * @param {string} filePath
 */
function dealFile(filePath) {
  const extName = filePath.split('.').pop()
  if (![ 'vue', 'ts', 'js' ].includes(extName)) {
    return
  }
  //
  let code = readFileSync(filePath, { encoding: 'utf-8' })
  //
  if (extName === 'vue') {
    code = dealVueFile(code)
  }
  //
  writeFileSync(filePath, code)
}

/**
 *
 * @param {string} dirPath
 */
function dealDir(dirPath) {
  const direntList = readdirSync(dirPath, { withFileTypes: true })
  for (const dirent of direntList) {
    const fullPath = resolve(dirPath, dirent.name)
    if (dirent.isFile()) {
      dealFile(fullPath)
    }
    if (dirent.isDirectory()) {
      dealDir(fullPath)
    }
  }
}

function main() {
  const srcDirPath = resolve(__dirname, '../src')
  dealDir(srcDirPath)
  const docsDirPath = resolve(__dirname, '../docs')
  dealDir(docsDirPath)
}

main()
