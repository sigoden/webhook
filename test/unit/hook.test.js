'use strict'

const test = require('ava')
const Hook = require('../../lib/hook')
const path = require('path')
const fs = require('fs')

const fixturesPath = path.join(__dirname, '../fixtures')
const store = {
  header: require(path.join(fixturesPath, 'header')),
  query: require(path.join(fixturesPath, 'query')),
  ip: '127.0.0.1',
  payload: require(path.join(fixturesPath, 'payload'))
}

test('loadFiles', t => {
  t.pass(Hook.loadFiles(['hook.json', path.join(fixturesPath, 'hook-simple.json'), 'hook-reload.json', 'hook-failed-arguments.json'], fixturesPath))
})

test('hookFileList', t => {
  t.deepEqual(Hook.hookFileList(), ['hook.json', 'hook-simple.json', 'hook-reload.json', 'hook-failed-arguments.json'].map(v => path.join(fixturesPath, v)))
})

test('getHook', t => {
  let filePath = path.join(fixturesPath, 'hook.json')
  let hooks = require(filePath)
  t.deepEqual(Hook.getHook('server'), Object.assign(hooks[0], {filePath}))
})

test('parseJSONParameter', t => {
  t.is(store.payload.extra, '{"k": "v"}')
  Hook.parseJSONParameter(Hook.getHook('server'), store)
  t.deepEqual(store.payload.extra, {k: 'v'})
})

test('evaluteRule', t => {
  let result = Hook.evaluteRule(Hook.getHook('server'), store)
  t.is(result, true)
})

test('evaluteRule return true when no rule found', t => {
  let result = Hook.evaluteRule(Hook.getHook('simple'), store)
  t.is(result, true)
})

test('extractCommandArguments', t => {
  let result = Hook.extractCommandArguments(Hook.getHook('server'), store)
  t.deepEqual(result, ['refs/heads/master'])
})

test('extractCommandArguments works when extract argument failed', t => {
  Hook.extractCommandArgumentsForEnv(Hook.getHook('argument-cmd-failed'), store)
  t.pass()
})

test('extractCommandArguments return [] when filed <pass-arguments-to-command> is not set', t => {
  let result = Hook.extractCommandArguments(Hook.getHook('simple'), store)
  t.deepEqual(result, [])
})

test('extractCommandArgumentsForEnv', t => {
  let result = Hook.extractCommandArgumentsForEnv(Hook.getHook('server'), store)
  t.deepEqual(result, {'HOOK_USER': 'sigoden'})
})

test('extractCommandArgumentsForEnv works when extract argument failed', t => {
  Hook.extractCommandArgumentsForEnv(Hook.getHook('argument-env-failed'), store)
  t.pass()
})

test('extractCommandArgumentsForEnv return {} when <pass-environment-to-command> is not set', t => {
  let result = Hook.extractCommandArgumentsForEnv(Hook.getHook('simple'), store)
  t.deepEqual(result, {})
})

test('reloadFile', t => {
  let origin = Hook.getHook('reload')
  let reloadHookPath = path.join(fixturesPath, 'hook-reload.json')
  t.is(origin.id, 'reload')
  let overwrite = fs.readFileSync(path.join(fixturesPath, 'hook-reload-overwrite.json'))
  fs.writeFileSync(reloadHookPath, overwrite)
  origin = Hook.getHook('reload')
  t.is(origin.id, 'reload')
  Hook.reloadFile(reloadHookPath, fixturesPath)
  t.is(Hook.getHook('reload'), undefined)
  origin = Hook.getHook('overwrite')
  t.is(origin.id, 'overwrite')
})

test.after.always('retrive origin hook-reload.json', t => {
  retriveHookReload()
})

test('reloadFiles', t => {
  let reloadHookPath = path.join(fixturesPath, 'hook-reload.json')
  let overwrite = fs.readFileSync(path.join(fixturesPath, 'hook-reload-overwrite.json'))
  fs.writeFileSync(reloadHookPath, overwrite)
  Hook.reloadAll()
  t.is(Hook.getHook('reload'), undefined)
  let origin = Hook.getHook('overwrite')
  t.is(origin.id, 'overwrite')
})

test.after.always('retrive origin hook-reload.json', t => {
  retriveHookReload()
})

function retriveHookReload () {
  let reloadHookPath = path.join(fixturesPath, 'hook-reload.json')
  let origin = fs.readFileSync(path.join(fixturesPath, 'hook-reload-origin.json'))
  fs.writeFileSync(reloadHookPath, origin)
}
