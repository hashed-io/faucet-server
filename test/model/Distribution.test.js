
const { BadRequest } = require('http-errors')
const { Keyring } = require('@polkadot/api')
const { DBConnection } = require('../../src/db')
const { Distribution, AuthChannel } = require('../../src/model')
const { BalancesApi, Polkadot } = require('../../src/service')
const { CryptoUtil } = require('../../src/util')
const { JWT } = require('@smontero/jwt')

const dbConn = new DBConnection()
const authChannel = new AuthChannel(dbConn)
const polkadot = new Polkadot({ wss: 'dummy' })
const balancesApi = new BalancesApi(polkadot, () => {})
const jwt = new JWT()
const distribution = new Distribution({
  dbConn,
  authChannel,
  polkadot,
  balancesApi,
  jwt,
  faucetAccountSigner: new Keyring().addFromUri('//Alice')
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('test distribute validations', () => {
  test('should fail for signature verification failure', async () => {
    spyVerifySignature(false)
    try {
      await distribution.distribute(getDisitributePayload(1))
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequest)
      expect(error.message).toContain('Invalid signature of jwt by: address1')
    }
  })
  test('should fail for non existant sub claim', async () => {
    spyVerifySignature(true)
    spyAuthChannelGetByName(1)
    spyJWTVerify({})
    try {
      await distribution.distribute(getDisitributePayload(1))
    } catch (error) {
      console.log(error)
      expect(error).toBeInstanceOf(BadRequest)
      expect(error.message).toContain('No claim value found for sub claim')
    }
  })
  test('should fail for invalid username claim', async () => {
    spyVerifySignature(true)
    spyAuthChannelGetByName(1)
    spyJWTVerify({ sub: 'userIdValue' })
    try {
      await distribution.distribute(getDisitributePayload(1))
    } catch (error) {
      console.log(error)
      expect(error).toBeInstanceOf(BadRequest)
      expect(error.message).toContain('No claim value found for username claim: usernameClaim1')
    }
  })

  test('should fail for userId to which tokens have already been distributed', async () => {
    spyVerifySignature(true)
    const { channel } = spyAuthChannelGetByName(1)
    spyJWTVerify({
      [channel.usernameClaim]: 'userNameClaimValue',
      sub: 'userIdValue'
    })
    spyDistributionFindLastByUserId(1)
    try {
      await distribution.distribute(getDisitributePayload(1))
    } catch (error) {
      console.log(error)
      expect(error).toBeInstanceOf(BadRequest)
      expect(error.message).toContain('Tokens have already been distributed to user with id: userIdValue')
    }
  })

  test('should fail for address to which tokens have already been distributed', async () => {
    spyVerifySignature(true)
    const { channel } = spyAuthChannelGetByName(1)
    spyJWTVerify({
      [channel.usernameClaim]: 'userNameClaimValue',
      sub: 'userIdValue'
    })
    spyDistributionFindLastByUserId()
    spyDistributionFindLastByAddress(1)
    try {
      await distribution.distribute(getDisitributePayload(1))
    } catch (error) {
      console.log(error)
      expect(error).toBeInstanceOf(BadRequest)
      expect(error.message).toContain('Tokens have already been distributed to address: address1')
    }
  })
})

describe('test distribution', () => {
  test('distribution should work', async () => {
    const verifySignatureMock = spyVerifySignature(true)
    const { channel, channelGetByNameMock } = spyAuthChannelGetByName(1)
    const username = 'userNameClaimValue'
    const userId = 'userIdValue'
    const jwtVerifyMock = spyJWTVerify({
      [channel.usernameClaim]: username,
      sub: userId
    })
    const findLastByAddressMock = spyDistributionFindLastByAddress(null)
    const insertMock = jest.spyOn(distribution, 'insert').mockResolvedValue(true)
    const transferMock = jest.spyOn(distribution, '_transfer').mockResolvedValue(true)
    const payload = getDisitributePayload(1)
    await distribution.distribute(payload)

    const {
      authName,
      address,
      jwt,
      signature
    } = payload

    const {
      audience,
      issuer,
      keyUrl,
      distributionAmount
    } = channel
    expect(verifySignatureMock).toHaveBeenCalledTimes(1)
    expect(verifySignatureMock).toHaveBeenCalledWith(address, jwt, signature)
    expect(channelGetByNameMock).toHaveBeenCalledTimes(1)
    expect(channelGetByNameMock).toHaveBeenCalledWith(authName)
    expect(jwtVerifyMock).toHaveBeenCalledTimes(1)
    expect(jwtVerifyMock).toHaveBeenCalledWith({
      token: jwt,
      keyUrl,
      opts: {
        issuer,
        audience
      }
    })
    expect(findLastByAddressMock).toHaveBeenCalledTimes(1)
    expect(findLastByAddressMock).toHaveBeenCalledWith(address)
    expect(insertMock).toHaveBeenCalledTimes(1)
    expect(insertMock).toHaveBeenCalledWith({
      address,
      amount: distributionAmount,
      authName,
      userId,
      username
    })
    expect(transferMock).toHaveBeenCalledTimes(1)
    expect(transferMock).toHaveBeenCalledWith(address, distributionAmount)
  })
})

function spyVerifySignature (response) {
  return jest.spyOn(CryptoUtil, 'verifySignature').mockReturnValue(response)
}

function spyAuthChannelGetByName (id) {
  const channel = getAuthChannel(id)
  return {
    channel,
    channelGetByNameMock: jest.spyOn(authChannel, 'getByName').mockResolvedValue(channel)
  }
}

function spyJWTVerify (payload) {
  return jest.spyOn(jwt, 'verify').mockResolvedValue({ payload })
}

function spyDistributionFindLastByUserId (id) {
  const dist = id ? getDistribution(id) : null
  return jest.spyOn(distribution, 'findLastByUserId').mockResolvedValue(dist)
}

function spyDistributionFindLastByAddress (id) {
  const dist = id ? getDistribution(id) : null
  return jest.spyOn(distribution, 'findLastByAddress').mockResolvedValue(dist)
}

function getDisitributePayload (id) {
  return {
    authName: `authName${id}`,
    address: `address${id}`,
    jwt: `jwt${id}`,
    signature: `signature${id}`
  }
}

function getAuthChannel (id) {
  return {
    audience: `audience${id}`,
    issuer: `issuer${id}`,
    keyUrl: `keyUrl${id}`,
    usernameClaim: `usernameClaim${id}`,
    distributionAmount: id
  }
}

function getDistribution (id) {
  return {
    distributionId: id,
    address: `address${id}`,
    amount: id,
    authName: `authName${id}`,
    username: `username${id}`,
    distributedAt: new Date(id)
  }
}
