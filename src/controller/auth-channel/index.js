'use strict'

const {
  getAuthChannelSchema
} = require('./schemas')

/**
 * Provides the endpoints for managing authentication channels
 */
module.exports = async function (fastify, opts) {
  /**
   * Returns the details for an authentication channel
   */
  fastify.register(async function (fastify) {
    fastify.get('/', { schema: getAuthChannelSchema }, getHandler)
  })
}

module.exports[Symbol.for('plugin-meta')] = {
  decorators: {
    fastify: [
      'authChannel'
    ]
  }
}

async function getHandler (req, reply) {
  return this.authChannel.getByName(req.query.authName)
}
