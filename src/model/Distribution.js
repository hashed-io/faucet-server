const { BadRequest } = require('http-errors')
const BaseDao = require('./BaseDao')
const { CryptoUtil } = require('./../util')

const SELECT_COLS =
  `
  d.distribution_id "distributionId",
  d.address,
  d.user_id "userId",
  d.amount,
  d.auth_name "authName",
  d.username,
  d.distributed_at "distributedAt"
  `

/**
 * Provides the functionality to manage token distributions
 */
class Distribution extends BaseDao {
  constructor ({
    dbConn,
    authChannel,
    balancesApi,
    faucetAccountSigner,
    jwt
  }) {
    super({
      dbConn,
      tableName: 'faucet.distribution',
      tableAlias: 'd'
    })
    this._authChannel = authChannel
    this._jwt = jwt
    this._balancesApi = balancesApi
    this._faucetAccountSigner = faucetAccountSigner
  }

  /**
   * @desc Validates a distribution request and if valid then distributes tokens
   * to the requested account
   *
   * @param {string} authName authentication channel name
   * @param {string} address the address to distribute tokens to
   * @param {string} jwt the JSON Web token generated by the auth channel
   * @param {string} signature resulting from the signing of the JWT by the address
   */
  async distribute ({
    authName,
    address,
    jwt,
    signature
  }) {
    if (!CryptoUtil.verifySignature(address, jwt, signature)) {
      throw new BadRequest(`Invalid signature of jwt by: ${address}`)
    }
    const {
      audience,
      issuer,
      keyUrl,
      usernameClaim,
      distributionAmount
    } = await this._authChannel.getByName(authName)
    const { payload } = await this._jwt.verify({
      token: jwt,
      keyUrl,
      opts: {
        issuer,
        audience
      }
    })
    const { sub: userId } = payload
    if (!userId) {
      throw new BadRequest('No claim value found for sub claim')
    }
    const username = payload[usernameClaim]
    if (!username) {
      throw new BadRequest(`No claim value found for username claim: ${usernameClaim}`)
    }

    if (await this.findLastByUserIdAndAuthName(userId, authName) != null) {
      throw new BadRequest(`Tokens have already been distributed to user with id: ${userId} and auth name: ${authName}`)
    }

    if (await this.findLastByAddress(address) != null) {
      throw new BadRequest(`Tokens have already been distributed to address: ${address}`)
    }
    await this._transfer(address, distributionAmount)

    await this.insert({
      address,
      userId,
      amount: distributionAmount,
      authName,
      username
    })
  }

  /**
   * @desc Finds the last distribution details for an address
   *
   * @param {string} address
   *
   * @return {Object} with the following structure
   *  {
   *    "distributionId": 1,
   *    "address": "5CUosdLowQn5KdZgXFqzUxGs3962cCWr1L8txYSyGkwsSFJY",
   *    "userId": "770beaea-bb6a-4006-ac2b-3316b98e0f14",
   *    "authName": "hashed-portal-google",
   *    "username": "pepe@gmail.com",
   *    "distributedAt": "2022-09-04 14:58:34.028"
   *  }
   */
  async findLastByAddress (address) {
    return this.dbConn.singleRow(`
      SELECT ${SELECT_COLS}
      FROM ${this.table}
      WHERE d.address = $1
      ORDER BY d.distributed_at DESC
    `,
    [address])
  }

  /**
   * @desc Finds last distribution details for a userId
   *
   * @param {string} userId
   * @param {string} authName
   *
   * @return {Object} with the following structure
   *  {
   *    "distributionId": 1,
   *    "address": "5CUosdLowQn5KdZgXFqzUxGs3962cCWr1L8txYSyGkwsSFJY",
   *    "userId": "770beaea-bb6a-4006-ac2b-3316b98e0f14",
   *    "authName": "hashed-portal-google",
   *    "username": "pepe@gmail.com",
   *    "distributedAt": "2022-09-04 14:58:34.028"
   *  }
   */
  async findLastByUserIdAndAuthName (userId, authName) {
    return this.dbConn.singleRow(`
      SELECT ${SELECT_COLS}
      FROM ${this.table}
      WHERE d.user_id = $1 and
      d.auth_name = $2
      ORDER BY d.distributed_at DESC
    `,
    [userId, authName])
  }

  /**
   * @desc Inserts a distribution details to the database
   *
   * @param {string} address
   * @param {int} amount
   * @param {authName} authentication channel name
   * @param {username} username associated to the address
   * @return {Object} with the following structure
   */
  async insert ({
    address,
    userId,
    amount,
    authName,
    username
  }) {
    return this.dbConn.singleRow(`
    INSERT INTO ${this.tableName}
    (address, user_id, amount, auth_name, username, distributed_at)
    VALUES($1, $2, $3, $4, $5, $6)
    `,
    [address, userId, amount, authName, username, new Date()])
  }

  async _transfer (address, amount) {
    return this._balancesApi.transfer({
      signer: this._faucetAccountSigner,
      dest: address,
      value: amount
    })
  }
}

module.exports = Distribution
