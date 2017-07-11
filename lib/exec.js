'use strict'

const execFile = require('child_process').execFile

function exec (cmd, args, options) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args || [], options || {}, (err, stdout, stderr) => {
      if (err) return reject(err)
      resolve({stdout, stderr})
    })
  })
}

module.exports = exec
