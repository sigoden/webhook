'use strict'

let absolutePath = require('./absolute-path')

// load json, if json file already loaded, clear cache then load again
function requireJSON (filePath, absolutePrefix) {
  let absoluteFilePath = absolutePath(filePath, absolutePrefix)
  let data = require(absoluteFilePath)
  delete require.cache[require.resolve(absoluteFilePath)]
  return {data, filePath: absoluteFilePath}
}

module.exports = requireJSON
