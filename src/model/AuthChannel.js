const { NotFound } = require('http-errors')
const BaseDao = require('./BaseDao')

const SELECT_COLS =
  `
  ac.auth_name "authName",
  ac.audience,
  ac.username_claim "usernameClaim",
  ap.issuer,
  ap.auth_provider "authProvider",
  ap.key_url "keyUrl",
  ac.distribution_amount "distributionAmount"
  `

class AuthChannel extends BaseDao {
  constructor (dbConn) {
    super({
      dbConn,
      tableName: 'faucet.auth_channel',
      tableAlias: 'ac'
    })
  }

  async findByName (authName) {
    return this.dbConn.singleRow(`
      SELECT ${SELECT_COLS}
      FROM ${this.table} INNER JOIN
           faucet.auth_provider ap ON ac.auth_provider = ap.auth_provider
      WHERE ac.auth_name = $1
    `,
    [authName])
  }

  async getByName (authName) {
    const channel = await this.findByName(authName)
    if (!channel) {
      throw new NotFound(`Auth channel with name: ${authName} not found`)
    }
    console.log(channel)
    return channel
  }
}

module.exports = AuthChannel
