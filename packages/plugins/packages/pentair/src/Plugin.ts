import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoPentairScreenlogicPayload } from './Payload'
import { XyoPentairScreenlogicSchema } from './Schema'
import { XyoPentairScreenlogicWitness, XyoPentairScreenlogicWitnessConfig } from './Witness'

export const XyoPentairScreenlogicPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoPentairScreenlogicPayload, XyoModuleParams<XyoPentairScreenlogicWitnessConfig>>({
    auto: true,
    schema: XyoPentairScreenlogicSchema,
    witness: async (params) => {
      return await XyoPentairScreenlogicWitness.create(params)
    },
  })
