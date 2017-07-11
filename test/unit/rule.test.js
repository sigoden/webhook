'use strict'

const test = require('ava')
const Rule = require('../../lib/rule')
const path = require('path')

const fixturesPath = path.join(__dirname, '../fixtures')

const store = {
  header: require(path.join(fixturesPath, 'header')),
  query: require(path.join(fixturesPath, 'query')),
  ip: '127.0.0.1',
  payload: require(path.join(fixturesPath, 'payload'))
}

test('match rule', t => {
  let suits = [
    {rule: {match: {type: 'value', value: 'refs/heads/master', parameter: {source: 'payload', name: 'ref'}}}, expect: true},
    {rule: {match: {type: 'regexp', value: '^refs', parameter: {source: 'payload', name: 'ref'}}}, expect: true}
  ]
  suits.forEach(v => {
    let rule = new Rule(v.rule, store)
    t.is(rule.evalute(), v.expect)
  })
})

test('match rule while match type is payload-hash-sha', t => {
  let suits = [
    {rule: {match: {type: 'payload-hash-sha1', secret: 'mysecret', parameter: {source: 'header', name: 'X-Gogs-Signature'}}}, expect: true, signature: '33f9d709782f62b8b4a0178586c65ab098a39fe2'},
    {rule: {match: {type: 'payload-hash-sha256', secret: 'mysecret', parameter: {source: 'header', name: 'X-Gogs-Signature'}}}, expect: true, signature: '9074a74de0f34ece3f046403ae88d2eea400281da0ed6ebfa76c949016fa672d'}
  ]
  suits.forEach(v => {
    store.header['x-gogs-signature'] = v.signature
    let rule = new Rule(v.rule, store)
    t.is(rule.evalute(), v.expect)
  })
})

test('not match rule', t => {
  let suits = [
    {rule: {not: {match: {type: 'value', value: 'refs/heads/master', parameter: {source: 'payload', name: 'ref'}}}}, expect: false}
  ]
  suits.forEach(v => {
    let rule = new Rule(v.rule, store)
    t.is(rule.evalute(), v.expect)
  })
})

test('and rule', t => {
  let suits = [
    {rule: {and: [{match: {type: 'value', value: 'refs/heads/master', parameter: {source: 'payload', name: 'ref'}}}, {match: {type: 'value', value: 'sigoden', parameter: {source: 'payload', name: 'pusher.username'}}}]}, expect: true},
    {rule: {and: [{match: {type: 'value', value: 'refs/heads/master', parameter: {source: 'payload', name: 'ref'}}}, {match: {type: 'value', value: 'anyone', parameter: {source: 'payload', name: 'pusher.username'}}}]}, expect: false}
  ]
  suits.forEach(v => {
    let rule = new Rule(v.rule, store)
    t.is(rule.evalute(), v.expect)
  })
})

test('or rule', t => {
  let suits = [
    {rule: {or: [{match: {type: 'value', value: 'refs/heads/dev', parameter: {source: 'payload', name: 'ref'}}}, {match: {type: 'value', value: 'anyone', parameter: {source: 'payload', name: 'pusher.username'}}}]}, expect: false},
    {rule: {or: [{match: {type: 'value', value: 'refs/heads/master', parameter: {source: 'payload', name: 'ref'}}}, {match: {type: 'value', value: 'anyone', parameter: {source: 'payload', name: 'pusher.username'}}}]}, expect: true}
  ]
  suits.forEach(v => {
    let rule = new Rule(v.rule, store)
    t.is(rule.evalute(), v.expect)
  })
})

test('unknown rule throw error', t => {
  let suits = [
    {rule: {match: {type: 'unknown', value: 'refs/heads/master', parameter: {source: 'payload', name: 'ref'}}}, expect: true},
    {rule: {nor: [{match: {type: 'regexp', value: '^refs', parameter: {source: 'payload', name: 'ref'}}}]}, expect: true}
  ]
  suits.forEach(v => {
    let rule = new Rule(v.rule, store)
    t.throws(() => rule.evalute(), Error)
  })
})
