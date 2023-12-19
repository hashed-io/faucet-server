
const { Keyring } = require('@polkadot/api')
const { BalancesApi, Polkadot } = require('../../src/service')

let polkadot
let balancesApi

jest.setTimeout(30000)

beforeAll(async () => {
  polkadot = new Polkadot({ wss: 'wss://c1.md5.hashed.live' })
  await polkadot.connect()
  balancesApi = new BalancesApi(polkadot, () => {})
})

describe('test transfer', () => {
  test('should work', async () => {
    const signer = new Keyring().addFromUri('NEED TO SPECIFY URI', {}, 'sr25519')
    await balancesApi.transfer({
      signer,
      dest: '5HBZ2CSDcRAjE6AKMKzuJ1w5c5iB6XaSn9h5eeAcGwcykKnz',
      value: '2000000000'
    })
  })
})
