'use strict'

const objectPath = require('object-path')

class Param {
  constructor (param, store) {
    this.param = param
    this.store = store
    this.name = param.name
    this.envname = param.envname
    this.source = param.source
    if (this.source === 'header') {
      this.name = decodeURIComponent(this.name.toLowerCase())
    }
  }

  get () {
    let source
    switch (this.source) {
      case 'header':
        source = this.store.header
        break
      case 'query':
        source = this.store.query
        break
      case 'payload':
        source = this.store.payload
        break
      case 'string':
        return this.name
      case 'entire-query':
        return JSON.stringify(this.store.query)
      case 'entire-payload':
        return JSON.stringify(this.store.payload)
      case 'entire-headers':
        return JSON.stringify(this.store.header)
    }
    if (source) {
      if (!objectPath.has(source, this.name)) {
        throw Error('couldn\'t retrieve argument for ' + this.toString())
      }
      return objectPath.get(source, this.name)
    }
  }

  toString () {
    return JSON.stringify(this.param)
  }

  update () {
    let source
    let value = JSON.parse(this.get())
    switch (this.source) {
      case 'header':
        source = this.store.header
        break
      case 'query':
        source = this.store.query
        break
      case 'payload':
        source = this.store.payload
        break
    }
    if (source) {
      objectPath.set(source, this.name, value)
    } else {
      throw Error('invalid source for argument %s', this)
    }
  }
}

module.exports = Param
