import { assertEx } from '@xylabs/assert'
import { Archivist, XyoArchivist, XyoArchivistGetQuerySchema, XyoArchivistWrapper } from '@xyo-network/archivist'
import { PartialModuleConfig, XyoModuleResolverFunc } from '@xyo-network/module'
import { Huri, XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { XyoDivinerDivineQuerySchema } from '../../Queries'
import { profile } from '../lib'
import { XyoHuriPayload, XyoHuriSchema } from '../XyoHuriPayload'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoArchivistPayloadDivinerConfig, XyoArchivistPayloadDivinerConfigSchema } from './Config'

export class XyoArchivistPayloadDiviner extends XyoPayloadDiviner<XyoPayload, XyoArchivistPayloadDivinerConfig> {
  protected readonly archivist?: Archivist

  constructor(config?: PartialModuleConfig<XyoArchivistPayloadDivinerConfig>, archivist?: XyoArchivist, resolver?: XyoModuleResolverFunc) {
    super({ ...config, schema: XyoArchivistPayloadDivinerConfigSchema }, undefined, resolver)
    const configArchivistAddress = config?.archivist
    const resolvedArchivist = archivist ?? (configArchivistAddress ? this.resolver?.(configArchivistAddress) : null)
    if (resolvedArchivist) {
      this.archivist = new XyoArchivistWrapper(resolvedArchivist)
    }
  }

  override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }

  public async divine(payloads?: XyoPayloads): Promise<XyoPayload | null> {
    const huriPayload = assertEx(payloads?.find((payload): payload is XyoHuriPayload => payload?.schema === XyoHuriSchema))
    const huriObj = new Huri(huriPayload.huri)
    const activeArchvist = this.archivist
    if (activeArchvist) {
      const [[, [payload = null]]] = await profile(
        async () => await activeArchvist.query({ hashes: [huriObj.hash], schema: XyoArchivistGetQuerySchema }),
      )
      return payload ?? null
    }
    return null
  }
}
