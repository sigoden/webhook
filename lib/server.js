'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const log = require('./log')
const loghttp = require('./loghttp')
const HttpStatus = require('http-status-codes')
const exec = require('./exec')
const Hook = require('./hook')

let app = express()
let rawBodySaver = function (req, res, buf, encoding) {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8')
  }
}

app.use(bodyParser.json({ verify: rawBodySaver }))
app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: true }))

module.exports = function (options) {
  app.use(function (req, res, next) {
    const start = new Date()
    next()
    const ms = new Date() - start
    loghttp(res.statusCode, ms, options.ip, options.port, req.method, req.originalUrl)
  })
  app.post(options.hooksUrl, function (req, res) {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    log('incoming HTTP request from %s', ip)
    res.set(options.hookHeaders || {}) // set headers passed from cli
    let id = req.params.id
    let hook = Hook.getHook(id)
    if (!hook) {
      res.status(404).send('Hook not found.')
      return
    }
    log('%s got matched', id)
    res.set(hook['response-headers'] || {}) // set headers passed from hook config
    let data = {
      header: req.headers,
      query: req.query,
      payload: req.body,
      rawPayload: req.rawBody,
      ip: ip
    }

    // preproces data
    try {
      Hook.parseJSONParameter(hook, data)
    } catch (e) {
      log('error parsing JSON parameters %s', e)
    }

    // evalute rule
    let pass
    try {
      pass = Hook.evaluteRule(hook, data)
    } catch (e) {
      log('error evaluating hook: %s', e)
      res.status(500).send('Error occurred while evaluating hook rules.')
      return
    }
    if (!pass) {
      let status = hook['trigger-rule-mismatch-http-response-code']
      if (status) {
        try {
          HttpStatus.getStatusText(status)
          res.status(status)
        } catch (e) {
          log('%s got matched, but the configured return code %d is unknown - defaulting to 200', id, status)
        }
      }
      log('%s got matched, but didn\'t get triggered because the trigger rules were not satisfied', id)
      res.send('Hook rules were not satisfied.')
      return
    }
    log('%s hook triggered successfully', id)

    // extractCommandArguments
    let args
    try {
      args = Hook.extractCommandArguments(hook, data)
    } catch (e) {
      log('error extracting command arguments: %s', e)
    }

    // extractCommandArgumentsForEnv
    let env
    try {
      env = Hook.extractCommandArgumentsForEnv(hook, data)
    } catch (e) {
      log('error extracting command arguments for environment: %s', e)
    }

    // excute cmd
    let cmd = hook['execute-command']
    let cwd = hook['command-working-directory']
    log('executing %s with arguments %s and environment %s using %s as cwd', cmd, JSON.stringify(args), JSON.stringify(env), cwd)
    exec(cmd, args, {cwd, env}).then(result => {
      let stdout = result.stdout
      let stderr = result.stderr
      log('command output: %s', stdout)
      if (stderr) log('error occurred while executing the hook: %s', stderr)
      log('finished handling %s', id)
      if (hook['include-command-output-in-response']) {
        if (stderr) {
          res.set('Content-Type', 'text/plain; charset=utf-8')
          res.status(500).send('Error occurred while executing the hook\'s command. Please check your logs for more details.')
        } else {
          res.send(stdout)
        }
        return
      }
      res.send(hook['response-message'])
    }, err => {
      log('error occurred while invoking thie hook\'s command: %s', err)
      log('finished handling %s', id)
      if (hook['include-command-output-in-response']) {
        res.send('error occurred while invoking thie hook\'s command. Please check your logs for more details.')
        return
      }
      res.send(hook['response-message'])
    })
  })
  app.use(function (err, req, res, next) {
    log('server error %s', err)
    res.status(500).send('server error ' + err)
  })
  return app
}
