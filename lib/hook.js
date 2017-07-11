'use strict'

const log = require('./log')
const requireJSON = require('./require-json')
const Param = require('./param')
const Rule = require('./rule')

const ENV_NAME = 'HOOK_'

let hookFiles = new Set()
let hooks = {}

function hookFileList () {
  return Array.from(hookFiles)
}

function getHook (id) {
  return hooks[id]
}

function loadFiles (files, absolutePrefix) {
  for (let hookFile of files) {
    loadFile(hookFile, absolutePrefix)
  }
}

// load config json
function loadFile (hookFile, absolutePrefix) {
  let result
  try {
    result = requireJSON(hookFile, absolutePrefix)
  } catch (e) {
    log('couldn\'t load data from file %s', hookFile)
  }
  if (!result) return
  let data = result.data
  let filePath = result.filePath
  log('found %d hook(s) in file', data.length)
  for (let hook of data) {
    hook.filePath = filePath
    addHook(hook)
  }
  hookFiles.add(filePath)
}

function addHook (hook) {
  let id = hook.id
  if (hooks[id]) {
    log('error: hook with the id %s has already been loaded! please check your hooks file for duplicate hooks ids!', id)
  }
  hooks[id] = hook
  log('\tloaded: %s', id)
}

// replaces parameter value with the passed value in the passed data based on the passed string
function parseJSONParameter (hook, data) {
  let jsonParameters = hook['parse-parameters-as-json']
  if (!Array.isArray(jsonParameters)) { return }
  for (let param of jsonParameters) {
    if (!param.source || !param.name) continue
    let myParam = new Param(param, data)
    myParam.update()
  }
}

// evalute trigger rule
function evaluteRule (hook, data) {
  let rule = hook['trigger-rule']
  if (!rule) { return true }
  let myRule = new Rule(rule, data)
  return myRule.evalute()
}

// create a list of arguments, based on the pass-arguments-to-command property that is ready to be used with exec
function extractCommandArguments (hook, data) {
  let args = hook['pass-arguments-to-command']
  let result = []
  if (!Array.isArray(args)) return result
  for (let arg of args) {
    try {
      let paramValue = new Param(arg, data).get()
      result.push(paramValue)
    } catch (e) {
      continue
    }
  }
  return result
}

// create a list of arguments in key=value format, based on the pass-environment-to-command property that is ready to be used with exec
function extractCommandArgumentsForEnv (hook, data) {
  let envs = hook['pass-environment-to-command']
  let result = {}
  if (!Array.isArray(envs)) return result
  for (let env of envs) {
    try {
      let param = new Param(env, data)
      let paramValue = param.get()
      let name = ENV_NAME + (param.envname || param.name)
      result[name] = paramValue
    } catch (e) {
      continue
    }
  }
  return result
}

// reload all config json files
function reloadAll () {
  hooks = {}
  let files = hookFileList()
  hookFiles.clear()
  loadFiles(files)
}

// reload a config json file
function reloadFile (hookFile) {
  log('attempting to reload hooks from %s', hookFile)
  removeHooksByFilePath(hookFile)
  loadFile(hookFile)
}

function removeHooksByFilePath (filePath) {
  for (let id in hooks) {
    if (hooks[id].filePath === filePath) {
      delete hooks[id]
    }
  }
}

module.exports = {
  hookFileList,
  getHook,
  loadFiles,
  parseJSONParameter,
  evaluteRule,
  extractCommandArguments,
  extractCommandArgumentsForEnv,
  reloadFile,
  reloadAll
}
