import express, { Application, Request, Response } from 'express'
import { getUSDValue } from '../common/common'
import { Logger } from 'tslog'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { Metaplex } from '@metaplex-foundation/js'

const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed')
const logger = new Logger({ name: 'api-server' })
const metaplex = Metaplex.make(connection)

export class ApiServer {
  public app: Application
  public port: number
  private server?: import('http').Server

  constructor(port: number) {
    this.app = express()
    this.port = port
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.app.get('/usd-value/:contract', this.handleGetUSDValue.bind(this))
  }

  private async handleGetUSDValue(req: Request, res: Response) {
    const { contract } = req.params
    try {
      const usdValue = await getUSDValue(contract)
      const metadata = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(contract) })

      logger.info(`${metadata?.symbol} Price: ${usdValue.toFixed(7)} `)
      // Ensure usdValue is a number
      res.json(usdValue.toNumber())
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  public listen() {
    this.server = this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`)
    })
  }

  public async close(timeoutMs: number = 10000): Promise<void> {
    // Default timeout of 10 seconds
    if (this.server) {
      // Gracefully shut down the server with a timeout
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          logger.error('Server shutdown timeout, forcefully terminating')
          reject(new Error('Server shutdown timeout'))
        }, timeoutMs)

        this.server!.close((err) => {
          clearTimeout(timeout) // Clear the timeout if the server closes in time
          if (err) {
            logger.error('Error during server shutdown:', err)
            reject(err)
          } else {
            logger.info('Server successfully shut down')
            resolve()
          }
        })
      })
    } else {
      return Promise.resolve()
    }
  }
}
