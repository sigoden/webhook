'use strict'

const test = require('ava')
const Param = require('../../lib/param')
const path = require('path')

const fixturesPath = path.join(__dirname, '../fixtures')

const store = {
  header: require(path.join(fixturesPath, 'header')),
  query: require(path.join(fixturesPath, 'query')),
  ip: '127.0.0.1',
  payload: require(path.join(fixturesPath, 'payload'))
}

test('should get value', t => {
  let suits = [
    {param: {source: 'header', name: 'host'}, expect: store.header.host},
    {param: {source: 'query', name: 'project'}, expect: store.query.project},
    {param: {source: 'payload', name: 'ref'}, expect: store.payload.ref},
    {param: {source: 'string', name: 'a'}, expect: 'a'},
    {param: {source: 'entire-query'}, expect: JSON.stringify(store.query)},
    {param: {source: 'entire-payload'}, expect: JSON.stringify(store.payload)},
    {param: {source: 'entire-headers'}, expect: JSON.stringify(store.header)}
  ]
  suits.forEach(v => {
    let param = new Param(v.param, store)
    t.is(param.get(), v.expect)
  })
})

test('should get value in deep path', t => {
  let suits = [
    {param: {source: 'payload', name: 'repository.name'}, expect: store.payload.repository.name},
    {param: {source: 'payload', name: 'repository.owner.id'}, expect: store.payload.repository.owner.id},
    {param: {source: 'payload', name: 'commits.0.id'}, expect: store.payload.commits[0].id}
  ]
  suits.forEach(v => {
    let param = new Param(v.param, store)
    t.is(param.get(), v.expect)
  })
})

test('should get header vaule when name is encoded', t => {
  let param = new Param({source: 'header', name: 'X%3D30'}, store)
  t.is(param.get(), store.header['x=30'])
})

test('should get header value ignore case', t => {
  let param = new Param({source: 'header', name: 'X-Gogs-Event'}, store)
  t.is(param.get(), store.header['x-gogs-event'])
})

test('should throw error when not found', t => {
  let param = new Param({source: 'payload', name: 'notfound'}, store)
  t.throws(() => param.get(), Error)
})

test('should update store', t => {
  let param = new Param({source: 'payload', name: 'extra'}, store)
  t.is(param.get(), '{"k": "v"}')
  param.update()
  t.deepEqual(store.payload.extra, {k: 'v'})
})

test('tostring', t => {
  let obj = {source: 'payload', name: 'extra'}
  let param = new Param(obj, store)
  t.is(param.toString(), JSON.stringify(obj))
})
