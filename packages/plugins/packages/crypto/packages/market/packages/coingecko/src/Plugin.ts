import { assertEx } from '@xylabs/sdk-js'
import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginConfig, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoWitness } from '@xyo-network/witness'

import { XyoCoingeckoCryptoMarketWitnessConfig } from './Config'
import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketPayloadSchema, XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'
import { XyoCoingeckoCryptoMarketPayloadTemplate } from './Template'
import { XyoCoingeckoCryptoMarketWitness } from './Witness'

export const XyoCoingeckoCryptoMarketPayloadPlugin: XyoPayloadPluginFunc<
  XyoCoingeckoCryptoMarketPayload,
  XyoCoingeckoCryptoMarketWitnessConfigSchema,
  XyoPayloadPluginConfig<XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketWitnessConfigSchema, XyoCoingeckoCryptoMarketWitnessConfig>
> = (config?): XyoPayloadPlugin<XyoCoingeckoCryptoMarketPayload> =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoCoingeckoCryptoMarketPayloadSchema,
    template: XyoCoingeckoCryptoMarketPayloadTemplate,
    witness: (): XyoWitness<XyoCoingeckoCryptoMarketPayload> => {
      return new XyoCoingeckoCryptoMarketWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
