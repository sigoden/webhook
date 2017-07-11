'use strict'

const Param = require('./param')
const SHA1 = require('crypto-js/hmac-sha1')
const SHA256 = require('crypto-js/hmac-sha256')
const rangeCheck = require('range_check')

class Rule {
  constructor (rule, store) {
    this.rule = rule
    this.store = store
  }

  evalute () {
    if (!this.rule) return true
    let key = Object.keys(this.rule)[0]
    let rule
    switch (key) {
      case 'and':
        rule = this.rule.and
        if (!Array.isArray(rule)) {
          throw Error('error evaluating hook, rule <and> should contains array')
        }
        return rule.every(subRule => {
          return new Rule(subRule, this.store).evalute()
        })
      case 'or':
        rule = this.rule.or
        if (!Array.isArray(rule)) {
          throw Error('error evaluating hook, rule <or> should contains array')
        }
        return rule.some(subRule => {
          return new Rule(subRule, this.store).evalute()
        })
      case 'not':
        rule = this.rule.not
        return !new Rule(rule, this.store).evalute()
      case 'match':
        rule = this.rule.match
        if (!rule.type) throw Error('invalid match rule, type unknown')
        if (rule.type === 'ip-whitelist') {
          return rangeCheck.inRange(this.store.ip, rule['ip-range'].split(','))
        }
        if (!rule.parameter) throw Error('invalid match rule, parameter missed')
        let paramValue
        try {
          paramValue = new Param(rule.parameter, this.store).get()
        } catch (e) {
          return false
        }
        switch (rule.type) {
          case 'value':
            return paramValue === rule.value
          case 'regexp':
            return new RegExp(rule.regexp).test(paramValue)
          case 'payload-hash-sha1':
            if (/^sha1=/.test(paramValue)) {
              paramValue = paramValue.slice(5)
            }
            return checkSHA(SHA1, this.store.rawPayload, rule.secret, paramValue)
          case 'payload-hash-sha256':
            if (/^sha256=/.test(paramValue)) {
              paramValue = paramValue.slice(7)
            }
            return checkSHA(SHA256, this.store.rawPayload, rule.secret, paramValue)
          default:
            throw Error('error evaluating hook, rule unknown')
        }
      default:
        throw Error('error evaluating hook, rule unknown')
    }
  }
}

function checkSHA (sha, rawPayload, secret, signature) {
  let expectedMAC = sha(rawPayload, secret).toString()
  if (expectedMAC !== signature) throw Error(`invalid payload signature ${signature}`)
  return true
}

module.exports = Rule
