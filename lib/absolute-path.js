'use strict'

let path = require('path')
let isRelative = require('is-relative')

// if filePath is relative, transform it to absolute path by joining with absolutePrefix
function absolutePath (filePath, absolutePrefix) {
  if (isRelative(filePath)) {
    filePath = path.join(absolutePrefix, filePath)
  }
  return filePath
}

module.exports = absolutePath
