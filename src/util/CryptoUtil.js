const { decodeAddress, signatureVerify } = require('@polkadot/util-crypto')
const { u8aToHex } = require('@polkadot/util')

class CryptoUtil {
  static verifySignature (address, payload, signature) {
    // return true
    return signatureVerify(payload, signature, this.getPublicKey(address)).isValid
  }

  static getPublicKey (address) {
    const pubKey = decodeAddress(address)
    return u8aToHex(pubKey)
  }
}

module.exports = CryptoUtil
