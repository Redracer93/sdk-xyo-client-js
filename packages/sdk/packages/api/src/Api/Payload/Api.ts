import { assertEx } from '@xylabs/assert'
import { XyoApiConfig } from '@xyo-network/api-models'
import { XyoPayload, XyoPayloadFindFilter } from '@xyo-network/payload'

import { XyoApiSimple } from '../../Simple'
import { WithArchive } from '../../WithArchive'
import { XyoArchivistArchivePayloadSchemaApi } from './Schema'

export interface XyoPayloadStats {
  count: number
}

export class XyoArchivistPayloadApi<
  T extends XyoPayload = XyoPayload,
  C extends WithArchive<XyoApiConfig> = WithArchive<XyoApiConfig>,
> extends XyoApiSimple<T[], T[], XyoPayloadFindFilter, C> {
  private _stats?: XyoApiSimple<XyoPayloadStats>
  public get schema(): XyoArchivistArchivePayloadSchemaApi {
    return new XyoArchivistArchivePayloadSchemaApi({
      ...this.config,
      root: `${this.root}schema/`,
    })
  }

  public get stats(): XyoApiSimple<XyoPayloadStats> {
    this._stats =
      this._stats ??
      new XyoApiSimple<XyoPayloadStats>({
        ...this.config,
        root: `${this.root}stats/`,
      })
    return this._stats
  }

  /** @deprecated use find */
  public async findAfter(timestamp: number, limit = 20) {
    return await this.find({ limit, order: 'asc', timestamp })
  }

  /** @deprecated use find */
  public async findBefore(timestamp: number, limit = 20) {
    return await this.find({ limit, order: 'desc', timestamp })
  }

  /** @deprecated use find */
  public async findMostRecent(limit = 20) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max limit = 100')
    return await this.find({ limit, order: 'desc', timestamp: 999999999999 })
  }

  /** @deprecated use find */
  public async getAfter(timestamp: number, limit = 20) {
    return await this.find({ limit, order: 'asc', timestamp })
  }

  /** @deprecated use findBefore */
  public async getBefore(timestamp: number, limit = 20) {
    return await this.find({ limit, order: 'desc', timestamp })
  }

  /** @deprecated use hash */
  public async getByHash(hash: string) {
    return await this.getEndpoint<T[]>(`hash/${hash}`)
  }

  /** @deprecated use find */
  public async getMostRecent(limit = 20) {
    return await this.find({ limit, order: 'desc', timestamp: 999999999999 })
  }

  /** @deprecated use stats instead */
  public async getStats() {
    return await this.getEndpoint<XyoPayloadStats>('stats')
  }

  public hash(hash: string): XyoApiSimple<XyoPayload[]> {
    return new XyoApiSimple<XyoPayload[]>({
      ...this.config,
      root: `${this.root}hash/${hash}/`,
    })
  }

  public async repair(hash: string) {
    return await this.getEndpoint<T[]>(`hash/${hash}/repair`)
  }

  /** @deprecated use repair */
  public async repairByHash(hash: string) {
    return await this.repair(hash)
  }
}
