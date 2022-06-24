import { Provider } from '@ethersproject/providers'
import { XyoQueryWitness } from '@xyo-network/core'

import { XyoCryptoMarketUniswapPayload, XyoCryptoMarketUniswapQueryPayload } from './Payload'
import { pricesFromUniswap3, UniSwap3Pair, uniswapPoolContracts } from './pricesFromUniswap3'

export class XyoUniswapCryptoMarketWitness extends XyoQueryWitness<XyoCryptoMarketUniswapQueryPayload, XyoCryptoMarketUniswapPayload> {
  protected provider: Provider
  protected pairs: UniSwap3Pair[]
  constructor(query: XyoCryptoMarketUniswapQueryPayload, provider: Provider) {
    super({
      targetSchema: XyoUniswapCryptoMarketWitness.schema,
      ...query,
    })
    this.provider = provider
    this.pairs = uniswapPoolContracts(provider)
  }

  override async observe(): Promise<XyoCryptoMarketUniswapPayload> {
    const pairs = await pricesFromUniswap3(this.pairs)

    return await super.observe({
      pairs,
    })
  }

  public static schema = 'network.xyo.crypto.market.uniswap'
}
