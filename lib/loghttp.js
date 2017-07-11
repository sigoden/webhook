'use strict'

const printf = require('printf')
const moment = require('moment')

// log http request
function loghttp (status, time, host, port, method, url) {
  let now = moment().format('YYYY/MM/DD HH:mm:ss')
  console.log('[webhook]', now, printf(' %d | % 10dms | %s:%d | %s %s', status, time, host, port, method, url))
}

module.exports = loghttp
