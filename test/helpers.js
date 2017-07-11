'use strict'

const net = require('net')
const request = require('superagent')
const fs = require('fs')
const path = require('path')

let portrange = 45032

function getPort () {
  let port = portrange
  let server = net.createServer()
  portrange += 1
  return new Promise((resolve) => {
    server.listen(port, function () {
      server.once('close', function () {
        resolve(port)
      })
      server.close()
    })
    server.on('error', function () {
      return getPort()
    })
  })
}

function waitForServer (url, interval, count) {
  interval = interval || 500
  count = count || 20
  function wait (cb) {
    function retry () {
      setTimeout(check, interval)
    }

    function check () {
      if (--count < 0) return cb(new Error('waitForServer timeout'))
      request(url).end(function (err) {
        if (err.code === 'ECONNREFUSED') return retry()
        cb()
      })
    }

    check()
  }

  return new Promise((resolve, reject) => {
    wait(err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

function genConfig (tmplPrefix, fileName, bin) {
  let tmplPath = path.join(tmplPrefix, fileName)
  let content = fs.readFileSync(tmplPath, {encoding: 'utf8'})
  let compiled = content.replace(/{{ .Hookecho }}/g, bin)
  let configPath = tmplPath + '.' + Date.now() + '.json'
  fs.writeFileSync(configPath, compiled)
  return configPath
}

function fetch (url, headers, body) {
  return new Promise((resolve, reject) => {
    request
      .post(url)
      .set(headers)
      .set('Content-Type', 'application/json')
      .send(body)
      .end(function (_, res) {
        resolve({status: res.status, text: res.text})
      })
  })
}

module.exports = {
  getPort,
  waitForServer,
  genConfig,
  fetch
}
