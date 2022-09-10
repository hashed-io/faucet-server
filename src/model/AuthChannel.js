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

/**
 * Provides the functionality to manage authentication channels
 */
class AuthChannel extends BaseDao {
  constructor (dbConn) {
    super({
      dbConn,
      tableName: 'faucet.auth_channel',
      tableAlias: 'ac'
    })
  }

  /**
   * @desc Finds an authentication channel by name
   *
   * @param {string} authName
   *
   * @return {Object} with the following structure
   *  {
   *    "authName": "hashed-portal-google",
   *    "authProvider": "google",
   *    "audience": "281519001757-5694ukk11kka29kcmq7ifdk6e4ci26dd.apps.googleusercontent.com",
   *    "issuer": "https://accounts.google.com",
   *    "keyUrl": "https://www.googleapis.com/oauth2/v3/certs",
   *    "usernameClaim": "email",
   *    "distributionAmount": 1000000000
   *  }
   */
  async findByName (authName) {
    return this.dbConn.singleRow(`
      SELECT ${SELECT_COLS}
      FROM ${this.table} INNER JOIN
           faucet.auth_provider ap ON ac.auth_provider = ap.auth_provider
      WHERE ac.auth_name = $1
    `,
    [authName])
  }

  /**
   * @desc Gets an authentication channel by name
   *
   * @param {string} authName
   *
   * @return {Object} with the following structure
   *  {
   *    "authName": "hashed-portal-google",
   *    "authProvider": "google",
   *    "audience": "281519001757-5694ukk11kka29kcmq7ifdk6e4ci26dd.apps.googleusercontent.com",
   *    "issuer": "https://accounts.google.com",
   *    "keyUrl": "https://www.googleapis.com/oauth2/v3/certs",
   *    "usernameClaim": "email",
   *    "distributionAmount": 1000000000
   *  }
   * @throws {NotFoundError} if the channel does not exist
   */

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
