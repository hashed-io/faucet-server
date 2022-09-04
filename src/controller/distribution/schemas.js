const { addressSchema, authNameSchema, jwtSchema, signatureSchema, response204 } = require('../../schemas')

const tags = ['distribution']

const distributeSchema = {
  tags,
  body: {
    type: 'object',
    required: ['authName', 'address', 'jwt', 'signature'],
    properties: {
      authName: authNameSchema,
      address: addressSchema,
      jwt: jwtSchema,
      signature: signatureSchema
    },
    additionalProperties: false
  },
  response: response204
}

module.exports = {
  distributeSchema
}
