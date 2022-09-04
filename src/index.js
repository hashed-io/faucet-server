const fastify = require('fastify')
const fp = require('fastify-plugin')
const fastifyEnv = require('@fastify/env')
const { Keyring } = require('@polkadot/keyring')
const { JWT } = require('@smontero/jwt')
const {
  AuthChannel,
  Distribution
} = require('./model')
const { DBConnection } = require('./db')
const { BalancesApi, Polkadot } = require('./service')

const envSchema = {
  type: 'object',
  required: ['PGHOST', 'PGUSER', 'PGDATABASE', 'PGPASSWORD', 'PGPORT', 'WSS', 'FAUCET_ACCOUNT_SURI', 'PORT'],
  properties: {
    PGHOST: {
      type: 'string'
    },
    PGUSER: {
      type: 'string'
    },
    PGDATABASE: {
      type: 'string'
    },
    PGPASSWORD: {
      type: 'string'
    },
    PGPORT: {
      type: 'integer'
    },
    WSS: {
      type: 'string'
    },
    FAUCET_ACCOUNT_SURI: {
      type: 'string'
    },
    PORT: {
      type: 'integer'
    }
  }
}
const swagger = {
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: 'Hashed Faucet Server',
      description: 'Hashed Faucet Server',
      version: '0.0.1'
    },
    consumes: [
      'application/json'
    ],
    produces: [
      'application/json'
    ]
  },
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  exposeRoute: true
}

function unhandledRejectionHandler (error) {
  console.error(error)
  process.exit(1)
}

async function connectToNetwork () {
  const {
    WSS
  } = process.env

  const polkadot = new Polkadot({
    wss: WSS
  })
  await polkadot.connect()
  return polkadot
}

async function decorateFastifyInstance (fastify) {
  const dbConn = new DBConnection()
  const authChannel = new AuthChannel(dbConn)
  const polkadot = await connectToNetwork()
  const balancesApi = new BalancesApi(polkadot, () => {})
  const {
    FAUCET_ACCOUNT_SURI: suri
  } = process.env
  const distribution = new Distribution({
    dbConn,
    authChannel,
    balancesApi,
    faucetAccountSigner: new Keyring().addFromUri(suri, {}, 'sr25519'),
    jwt: new JWT()
  })

  fastify.decorate('authChannel', authChannel)
  fastify.decorate('distribution', distribution)
}

async function main () {
  const {
    NODE_ENV,
    PORT // has to come from env vars because its set by app services
  } = process.env
  const logger = {}
  if (NODE_ENV !== 'production') {
    logger.transport = { target: 'pino-pretty' }
  }
  // Create the instance
  const server = fastify({ logger, pluginTimeout: 20000 })
  // Add application assets and manifest.json serving
  server.log.info(`cwd: ${process.cwd()}`)
  server.register(fastifyEnv, {
    schema: envSchema,
    dotenv: true
  })
    .register(require('@fastify/swagger'), swagger)
    .register(require('@fastify/cors'), {
      origin: true,
      credentials: true,
      allowedHeaders: 'Authorization, Origin, X-Requested-With, Content-Type, Accept'
    })
    .register(fp(decorateFastifyInstance))
    // APIs modules
    .register(require('./controller/auth-channel'), { prefix: '/api/auth-channel' })
    .register(require('./controller/distribution'), { prefix: '/api/distribution' })
    .setErrorHandler(function (error, request, reply) {
      server.log.info(error)
      reply.send(error)
    })
  await server.ready()
  server.swagger()
  // Run the server!
  await server.listen({ port: PORT || 3000, host: '0.0.0.0' })
  return server
}

process.on('unhandledRejection', unhandledRejectionHandler)
main().catch(unhandledRejectionHandler)
