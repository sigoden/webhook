'use strict'

const test = require('ava')
const exec = require('../../lib/exec')
const path = require('path')

const fixturesPath = path.join(__dirname, '../fixtures')

test('should run cmd and return stdout and stderr', async t => {
  let {stdout, stderr} = await exec(path.join(fixturesPath, 'echo-ok.sh'))
  t.is(stdout, 'ok\n')
  t.is(stderr, '')
})

test('should run cmd with args', async t => {
  let args = ['a', 'b', 'c']
  let {stdout} = await exec(path.join(fixturesPath, 'echo-args.sh'), args)
  t.is(stdout, args.join(' ') + '\n')
})

test('should run cmd with env', async t => {
  let env = {a: 'a'}
  let {stdout} = await exec(path.join(fixturesPath, 'echo-env.sh'), [], {env})
  t.is(stdout, 'a\n')
})

test('should run cmd in cwd', async t => {
  let cwd = '/tmp'
  let {stdout} = await exec(path.join(fixturesPath, 'echo-cwd.sh'), [], {cwd})
  t.is(stdout, cwd + '\n')
})

test('should reject when cmd faild ', async t => {
  await t.throws(exec(path.join(fixturesPath, 'error.sh')))
})

test('should reject when cmd missed', async t => {
  await t.throws(exec(path.join(fixturesPath, 'miss.sh')))
})
