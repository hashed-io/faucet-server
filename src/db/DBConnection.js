const { Pool } = require('pg')
const DBRequestProvider = require('./DBRequestProvider')
const DBTransaction = require('./DBTransaction')

class DBConnection extends DBRequestProvider {
  constructor () {
    super()
    this._pool = new Pool()
  }

  async getTransaction () {
    return new DBTransaction((await this._pool.connect()))
  }

  async end () {
    await this._pool.end()
  }

  client () {
    return this._pool
  }
}

module.exports = DBConnection
