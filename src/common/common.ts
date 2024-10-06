import Decimal from 'decimal.js'
import { RAYDIUM_API_URL, USDC_MINT_ADDRESS, ZERO } from './constants'
import axios from 'axios'
import { Logger } from 'tslog'

const logger = new Logger({ name: 'common' })

async function getUSDValueJupiter(tokenId: string): Promise<Decimal> {
  const apiUrl = `https://price.jup.ag/v6/price`
  const params = {
    ids: tokenId,
    vsToken: USDC_MINT_ADDRESS,
  }

  try {
    const response = await axios.get(apiUrl, { params })
    const priceData = response.data.data[tokenId]
    if (priceData) {
      const price = priceData.price
      return new Decimal(price)
    }
    return ZERO
  } catch (error) {
    logger.error('Error fetching price from Jupiter')
    return ZERO
  }
}

async function getUSDValueRaydium(tokenAddress: string): Promise<Decimal> {
  try {
    const response = await axios.get(RAYDIUM_API_URL + tokenAddress)
    return new Decimal(response.data.data[tokenAddress])
  } catch (error) {
    logger.error('Error fetching price from Raydium')
    return ZERO
  }
}

export async function getUSDValue(tokenAddress: string): Promise<Decimal> {
  const jupPricePromise = getUSDValueJupiter(tokenAddress)
  const raydiumPricePromise = getUSDValueRaydium(tokenAddress)

  const [jupPrice, raydiumPrice] = await Promise.all([jupPricePromise, raydiumPricePromise])

  if (!jupPrice.isZero() && !raydiumPrice.isZero()) {
    const mean = jupPrice.add(raydiumPrice).div(2)
    const variance = jupPrice.sub(mean).pow(2).add(raydiumPrice.sub(mean).pow(2)).div(2)
    const stdDev = variance.sqrt().mul(4)

    if (jupPrice.sub(raydiumPrice).abs().lessThanOrEqualTo(stdDev)) {
      const avgPrice = mean
      logger.info(
        `Jupiter price: ${jupPrice.toFixed(7)} | Raydium price: ${raydiumPrice.toFixed(7)} | Average Price: ${avgPrice.toFixed(7)}`
      )
      return avgPrice
    } else {
      const higherPrice = jupPrice.greaterThan(raydiumPrice) ? jupPrice : raydiumPrice
      logger.info(
        `Jupiter price: ${jupPrice.toFixed(7)} | Raydium price: ${raydiumPrice.toFixed(7)} | Higher Price: ${higherPrice.toFixed(7)}`
      )
      return higherPrice
    }
  }
  return raydiumPrice.isZero() ? jupPrice : raydiumPrice
}
