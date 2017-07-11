'use strict'

const test = require('ava')
const requireJSON = require('../../lib/require-json')
const path = require('path')
const fs = require('fs')

const fixturesPath = path.join(__dirname, '../fixtures')

test('should require json with absolute path', t => {
  let jsonPath = path.join(fixturesPath, 'a.json')
  let {data, filePath} = requireJSON(jsonPath)
  t.deepEqual(data, {a: 'a'})
  t.is(filePath, jsonPath)
})

test('should require json with relative path', t => {
  let jsonPath = 'a.json'
  let {data, filePath} = requireJSON(jsonPath, fixturesPath)
  t.deepEqual(data, {a: 'a'})
  t.is(filePath, path.join(fixturesPath, jsonPath))
})

test('should ignore absolute prefix path when path is absolute', t => {
  let jsonPath = path.join(fixturesPath, 'a.json')
  let {data} = requireJSON(jsonPath, '/tmp')
  t.deepEqual(data, {a: 'a'})
})

let tmpjPath = path.join('/tmp', Date.now() + '.json')
test.cb.before('prepare cached json file', t => {
  fs.writeFile(tmpjPath, JSON.stringify({a: 'a'}), t.end)
})
test.cb('should disabled cache', t => {
  requireJSON(tmpjPath)
  fs.writeFile(tmpjPath, JSON.stringify({a: 'b'}), (err) => {
    if (err) return t.end(err)
    let {data} = requireJSON(tmpjPath)
    t.deepEqual(data, {a: 'b'})
    t.end()
  })
})
test.cb.after.always('remove cached json file', t => {
  fs.unlink(tmpjPath, t.end)
})

test('should throw error when path not existed', t => {
  let jsonPath = path.join(fixturesPath, 'a-miss.json')
  t.throws(() => requireJSON(jsonPath))
})

test('should throw error when invalid json', t => {
  let jsonPath = path.join(fixturesPath, 'a-error.json')
  t.throws(() => requireJSON(jsonPath))
})
