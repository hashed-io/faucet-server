'use strict'

const {
  distributeSchema
} = require('./schemas')

/**
 * Provides the endpoints for managing distributions
 */
module.exports = async function (fastify, opts) {
  /**
   * Validates that it is a valid request and then distributes tokens to the requested account
   */
  fastify.register(async function (fastify) {
    fastify.post('/distribute', { schema: distributeSchema }, distributeHandler)
  })
}

module.exports[Symbol.for('plugin-meta')] = {
  decorators: {
    fastify: [
      'distribution'
    ]
  }
}

async function distributeHandler (req, reply) {
  return this.distribution.distribute(req.body)
}
