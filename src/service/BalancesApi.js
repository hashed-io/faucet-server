const BasePolkadotApi = require('./BasePolkadotApi')

class BalancesApi extends BasePolkadotApi {
  constructor (polkadotApi, notify) {
    super(polkadotApi, 'balances', notify)
  }

  async transfer ({ signer, dest, value }) {
    return this.callTx({
      extrinsicName: 'transferAllowDeath',
      signer,
      params: [dest, value]
    })
  }
}

module.exports = BalancesApi
