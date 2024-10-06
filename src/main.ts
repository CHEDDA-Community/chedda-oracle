import { Logger } from 'tslog'
import { ApiServer } from './api/apiServer'

const logger = new Logger({ name: 'main' })

async function main() {
  logger.info('Starting CHEDDA Oracle API Server')
  const server = new ApiServer(3000)

  try {
    server.listen()
    logger.info('Server is listening on port 3000')
  } catch (err) {
    logger.error('Failed to start server:', err)
    process.exit(1)
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server')
    await server.close()
    logger.info('HTTP server closed')
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    logger.info('SIGINT signal received: closing HTTP server')
    await server.close()
    logger.info('HTTP server closed')
    process.exit(0)
  })
}

main().catch((err) => logger.error('Unhandled error:', err))
