'use strict'

const printf = require('printf')
const moment = require('moment')

function log () {
  if (!process.env.LOG) return // omit when verbose is not set
  let now = moment().format('YYYY/MM/DD HH:mm:ss')
  console.log('[webhook]', now, printf.apply(printf,  Array.prototype.slice.call(arguments)))
}

module.exports = log
