'use strict'

const log = require('./log')
const hook = require('./hook')

function signal () {
  log('setting up os signal watcher')
  process.on('SIGUSR1', function () {
    log('caught USR1 signal')
    hook.reloadAll()
  })
}

module.exports = signal
