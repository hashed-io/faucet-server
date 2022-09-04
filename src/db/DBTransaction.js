const DBRequestProvider = require('./DBRequestProvider')

class DBTransaction extends DBRequestProvider {
  constructor (client) {
    super()
    this._client = client
  }

  _client () {
    return this._client
  }

  async begin () {
    await this.query('BEGIN')
  }

  async commit () {
    await this.query('COMMIT')
  }

  async rollback () {
    await this.query('ROLLBACK')
  }

  async end () {
    await this.client.release()
  }
}

module.exports = DBTransaction
