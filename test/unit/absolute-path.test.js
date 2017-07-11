'use strict'

const test = require('ava')
const absolutePath = require('../../lib/absolute-path')

test('have no effect on absolute path', t => {
  let suits = [
    '/usr/local/bin/node',
    'C:\\Program Files\\nodejs\\node'
  ]
  suits.forEach(v => {
    t.is(absolutePath(v), v, `absolutePath(${v}) === ${v}`)
  })
})

test('join relative path with absolute prefix', t => {
  let suits
  if (!/^win/.test(process.platform)) {
    suits = [
      {filePath: 'node', absolutePrefix: '/usr/local/bin', expect: '/usr/local/bin/node'},
      {filePath: './node', absolutePrefix: '/usr/local/bin', expect: '/usr/local/bin/node'},
      {filePath: '../node', absolutePrefix: '/usr/local/bin', expect: '/usr/local/node'},
      {filePath: './../node', absolutePrefix: '/usr/local/bin', expect: '/usr/local/node'}
    ]
  } else {
    suits = [
      {filePath: 'node', absolutePrefix: 'C:\\Program Files\\nodejs', expect: 'C:\\Program Files\\nodejs\\node'},
      {filePath: '..\\node', absolutePrefix: 'C:\\Program Files\\nodejs', expect: 'C:\\Program Files\\node'}
    ]
  }
  suits.forEach(v => {
    t.is(absolutePath(v.filePath, v.absolutePrefix), v.expect, `absolutePath(${v.filePath}, ${v.absolutePrefix}) === ${v.expect}`)
  })
})
