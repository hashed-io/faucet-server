const { authNameSchema } = require('../../schemas')

const tags = ['auth-channel']

const authProviderSchema = { type: 'string', minLength: 3, maxLength: 50 }
const audienceSchema = { type: 'string', minLength: 3, maxLength: 300 }
const issuerSchema = { type: 'string', minLength: 3, maxLength: 300 }
const keyUrlSchema = { type: 'string', minLength: 3, maxLength: 300 }
const usernameClaimSchema = { type: 'string', minLength: 3, maxLength: 50 }
const distributionAmountSchema = { type: 'integer' }

const authChannelSchema = {
  type: 'object',
  required: ['authName', 'authProvider', 'audience', 'issuer', 'keyUrl', 'usernameClaim', 'distributionAmount'],
  properties: {
    authName: authNameSchema,
    authProvider: authProviderSchema,
    audience: audienceSchema,
    issuer: issuerSchema,
    keyUrl: keyUrlSchema,
    usernameClaim: usernameClaimSchema,
    distributionAmount: distributionAmountSchema
  },
  additionalProperties: false
}

const getAuthChannelSchema = {
  tags,
  query: {
    type: 'object',
    properties: {
      authName: authNameSchema
    },
    required: ['authName']
  },
  response: {
    200: authChannelSchema
  }
}

module.exports = {
  getAuthChannelSchema
}
