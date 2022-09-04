'use strict'

const {
  getAuthChannelSchema
} = require('./schemas')

module.exports = async function (fastify, opts) {
  // Route registration
  // fastify.<method>(<path>, <schema>, <handler>)
  // schema is used to validate the input and serialize the output

  // Logged APIs
  fastify.register(async function (fastify) {
    fastify.get('/', { schema: getAuthChannelSchema }, getHandler)
  })
}

// Fastify checks the existance of those decorations before registring `user.js`
module.exports[Symbol.for('plugin-meta')] = {
  decorators: {
    fastify: [
      'authChannel'
    ]
  }
}

// In all handlers `this` is the fastify instance
// The fastify instance used for the handler registration

async function getHandler (req, reply) {
  return this.authChannel.getByName(req.query.authName)
}
