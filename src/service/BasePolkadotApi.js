const Polkadot = require('./Polkadot')

class BasePolkadotApi {
  /**
   * Class constructor
   * @param {Polkadot} polkadot Instance from Polkadot class
   * @param {String} palletName Pallet Name
   */
  constructor (polkadot, palletName, notify) {
    if (!(polkadot instanceof Polkadot)) {
      polkadot = new Polkadot({ api: polkadot })
    }
    this.polkadot = polkadot
    this.palletName = palletName
    this.notify = notify
  }

  /**
   * @name callTx
   * @description Call a TX from polkadot api for a specific pallet and handler response subscription
   * @param {String} extrinsicName Extrinsic function name to call
   * @param {String} signer User address to sign transaction
   * @param {*} params Params for extrinsic function
   * @returns tx response from polkadot api
   */
  async callTx ({
    extrinsicName,
    params,
    signer = null,
    sudo = false
  }) {
    const txResponseHandler = (e, resolve, reject, unsub) => {
      this.handlerTXResponse(e, resolve, reject, unsub)
    }
    return this.polkadot.callTx({
      palletName: this.palletName,
      extrinsicName,
      params,
      txResponseHandler,
      signer,
      sudo
    })
  }

  /**
   * @name exQuery
   * @description Execute a query or query subscription from polkadot api
   * @param {String} queryName Query name to execute
   * @param {*} params Params for query execution
   * @param {*} subTrigger Function handler to query subscription
   * @returns Query response or unsubscribe function from polkadot api
   */
  async exQuery (queryName, params, subTrigger) {
    return this.polkadot.query()[this.palletName][queryName](...params, subTrigger)
  }

  /**
   * @name exMultiQuery
   * @description Execute a query or query subscription from polkadot api
   * @param {String} queryName Query name to execute
   * @param {Array} params Params for query execution, Params [Array]
   * @param {*} subTrigger Function handler to query subscription
   * @returns Query response or unsubscribe function from polkadot api
   */
  async exMultiQuery (queryName, params, subTrigger) {
    return this.polkadot.query()[this.palletName][queryName].multi(params, subTrigger)
  }

  /**
   * @name exEntriesQuery
   * @description Execute a query or query subscription from polkadot api
   * @param {String} queryName Query name to execute
   * @param {Array} params Params for query execution, Params [Array]
   * @param {*} subTrigger Function handler to query subscription
   * @returns Query response or unsubscribe function from polkadot api
   */
  async exEntriesQuery (queryName, params, subTrigger) {
    return this.polkadot.query()[this.palletName][queryName].entries(...params)
  }

  /**
   * @name handlerTXResponse
   * @description Function to resolve a promise evaluating Extrinsic state event
   * @param {*} e Event from transaction subscription
   * @param {*} resolve Resolve Function
   * @param {*} reject Reject Function
   * @param {*} unsub Unsubscribe Function
   */
  async handlerTXResponse (e, resolve, reject, unsub) {
    this.notify({
      message: 'Waiting for Hashed Chain confirmation',
      // background: 'green',
      type: 'listening'
    })
    const { events = [], status } = e
    // console.log('events', events)
    // console.log('status', status)
    if (status.isFinalized || status.isInBlock) {
      // console.log(`Transaction included at blockHash ${status.asFinalized}`)

      // Loop through Vec<EventRecord> to display all events
      // events.forEach(({ phase, event: { data, method, section } }) => {
      //   console.log(`\t' ${phase}: ${section}.${method}:: ${data}`)
      // })

      events.filter(({ event: { section } }) => section === 'system').forEach(({ event: { method, data } }) => {
        if (method === 'ExtrinsicFailed') {
          // txFailedCb(result);
          console.log('ExtrinsicFailed', data)
          const [dispatchError] = data
          let errorInfo

          console.log('ExtrinsicFailed error', data)
          // decode the error
          if (dispatchError.isModule) {
            const decoded = data.registry.findMetaError(dispatchError.asModule)
            errorInfo = `${decoded.section}.${decoded.name}`
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            errorInfo = dispatchError.toString()
          }

          // console.error('errorInfo', errorInfo)
          // console.log('unsub', unsub)
          unsub()
          reject(`Extrinsic failed: ${errorInfo}`)
          // const mod = data[0].asModule
        } else if (method === 'ExtrinsicSuccess') {
          // console.log('ExtrinsicSuccess', data)
          // console.log('unsub', unsub)
          unsub()
          resolve(data)
          // txSuccessCb(result);
        }
      })
    }
  }

  /**
   * @description Just a function to map entries response
   * @param {Array} entries Entries query response
   * @returns Array
   */
  mapEntries (entries) {
    if (!entries.isEmpty) {
      return entries.map(e => {
        // console.log('IDDDD', e[0], e[0].toHuman())
        return {
          key: e[0],
          id: e[0].toHuman(),
          value: e[1].toHuman()
        }
      })
    }
    return undefined
  }
}

module.exports = BasePolkadotApi
