const { ApiPromise, WsProvider } = require('@polkadot/api')

class Polkadot {
  constructor ({
    wss = null
  }) {
    this._wss = wss
    this._api = null
  }

  /**
   * @description Connect to WSS server and get api
   * @returns {Object}
   * { chain, nodeName, nodeVersion }
   */
  async _connect () {
    try {
      // \Initialize the provider to connect to the local node
      // console.log('connecting to ', this._wss)
      const provider = new WsProvider(this._wss)

      // Create the API and wait until ready
      // const api = new ApiPromise({ provider })
      // this.api = api
      // console.log('api', api)
      return ApiPromise.create({ provider })
      // Retrieve the chain & node information information via rpc calls
    } catch (e) {
      console.error('connect polkadot Api', e)
      throw new Error(e)
    }
  }

  async connect () {
    if (!this.isConnected()) {
      this._api = await this._connect()
    }
  }

  /**
   * @name callTx
   * @description Calls the extrinsic specified by the parameters
   * @param {String} palletName name of the pallet
   * @param {String} extrinsicName Name of the extrinsic
   * @param {Array} params Array with the extrinsic parameters
   * @param {function} txResponseHandler The function that will handle the tx reponse
   * @param {String|KeyPair} [signer] The signer of the tx, the parameter is optional,
   * it depends on the configured wallet if the parameter is required or not
   * @param {boolean} sudo Whether the call should be done as sudo
   * @returns tx response from polkadot api
   */
  async callTx ({
    palletName,
    extrinsicName,
    params,
    txResponseHandler,
    signer,
    sudo = false
  }) {
    params = params || []
    // console.log('callTx: ', extrinsicName, signer, params)
    // console.log('callTx params', params)
    let unsub
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const tx = this.tx()
        let call = tx[palletName][extrinsicName](...params)
        if (sudo) {
          call = tx.sudo.sudo(call)
        }
        unsub = await call.signAndSend(signer, (e) => txResponseHandler(e, resolve, reject, unsub))
      } catch (e) {
        reject(e)
      }
    })
  }

  tx () {
    return this._api.tx
  }

  isConnected () {
    return !!this._api
  }

  /**
   * @name chainInfo
   * @description Returns information of the chain it is connected to
   * @returns Object
   */
  async chainInfo () {
    const [chain, nodeName, nodeVersion] = await Promise.all([
      this._api.rpc.system.chain(),
      this._api.rpc.system.name(),
      this._api.rpc.system.version()
    ])

    return {
      chain,
      nodeName,
      nodeVersion
    }
  }

  async disconnect () {
    if (this.isConnected()) {
      await this._api.disconnect()
      delete this._api
    }
  }
}

module.exports = Polkadot
