const { BadRequest } = require('http-errors')
const BaseDao = require('./BaseDao')
const { CryptoUtil } = require('./../util')

const SELECT_COLS =
  `
  d.distribution_id "distributionId",
  d.address,
  d.amount,
  d.auth_name "authName",
  d.username,
  d.distributed_at "distributedAt"
  `

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
    const username = payload[usernameClaim]
    if (!username) {
      throw new BadRequest(`No claim value found for username claim: ${usernameClaim}`)
    }
    if (await this.findLastByAddress(address) != null) {
      throw new BadRequest(`Tokens have already been distributed to address: ${address}`)
    }
    await this.insert({
      address,
      amount: distributionAmount,
      authName,
      username
    })

    await this._transfer(address, distributionAmount)
  }

  async findLastByAddress (address) {
    return this.dbConn.singleRow(`
      SELECT ${SELECT_COLS}
      FROM ${this.table}
      WHERE d.address = $1
      ORDER BY d.distributed_at DESC
    `,
    [address])
  }

  async insert ({
    address,
    amount,
    authName,
    username
  }) {
    return this.dbConn.singleRow(`
    INSERT INTO ${this.tableName}
    (address, amount, auth_name, username, distributed_at)
    VALUES($1, $2, $3, $4, $5)
    `,
    [address, amount, authName, username, new Date()])
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
