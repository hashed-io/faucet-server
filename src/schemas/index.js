
const addressSchema = { type: 'string', minLength: 30, maxLength: 55 }
const authNameSchema = { type: 'string', minLength: 3, maxLength: 50 }
const publicKeySchema = { type: 'string', minLength: 53, maxLength: 53, nullable: true }

const uuidTypeSchema = { type: 'string', minLength: 36, maxLength: 36 }

const emailTypeSchema = {
  type: 'string',
  pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'
}

const passwordTypeSchema = {
  type: 'string',
  pattern: '^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$'
}

const verificationCodeTypeSchema = {
  type: 'string',
  pattern: '^\\d{6,6}$'
}

const jwtSchema = { type: 'string' }
const signatureSchema = { type: 'string' }

const extendSearchBodySchema = (props = {}, required = []) => {
  return {
    type: 'object',
    required,
    properties: {
      search: { type: 'string' },
      orderBy: { type: 'string' },
      desc: { type: 'boolean' },
      offset: { type: 'integer', minimum: 0 },
      limit: { type: 'integer', minimum: 1 },
      ...props
    },
    additionalProperties: false
  }
}

const itemUUIDSchema = {
  type: 'object',
  properties: {
    id: uuidTypeSchema
  },
  additionalProperties: false
}

const itemIntIdSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' }
  },
  additionalProperties: false
}

const itemIntIdArraySchema = {
  type: 'object',
  properties: {
    ids: {
      type: 'array',
      items: { type: 'integer' }
    }
  },
  additionalProperties: false
}

const dbSearchBodySchema = extendSearchBodySchema()

const response204 = {
  204: {
    type: 'null',
    description: 'Empty response on success'
  }
}

module.exports = {
  addressSchema,
  authNameSchema,
  publicKeySchema,
  emailTypeSchema,
  passwordTypeSchema,
  uuidTypeSchema,
  extendSearchBodySchema,
  dbSearchBodySchema,
  itemUUIDSchema,
  itemIntIdSchema,
  itemIntIdArraySchema,
  jwtSchema,
  signatureSchema,
  response204,
  verificationCodeTypeSchema
}
