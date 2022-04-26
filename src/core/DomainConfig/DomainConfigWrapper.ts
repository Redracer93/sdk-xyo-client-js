import axios, { AxiosError } from 'axios'
import reverse from 'lodash/reverse'

import { XyoApiEnvelope } from '../../Api'
import { DnsRecordType, domainResolve, isBrowser } from '../../lib'
import { Huri } from '../Huri'
import { XyoPayload, XyoPayloadWrapper } from '../Payload'
import { XyoDomainConfig } from './DomainConfig'

export class XyoDomainConfigWrapper extends XyoPayloadWrapper<XyoDomainConfig> {
  public aliases?: XyoPayload[] | null

  private getNetwork(slug?: string) {
    return slug ? this.payload.networks?.find((value) => value.slug === slug) : this.payload.networks?.[0]
  }

  private findArchivistUri(networkSlug?: string) {
    return this.getNetwork(networkSlug)?.nodes.find((value) => value.type === 'archivist')?.uri
  }

  public async fetchAliases(networkSlug?: string) {
    //set it to null to signify fetch ran
    this.aliases = null

    const archivistUri = this.findArchivistUri(networkSlug)
    if (this.payload.aliases) {
      const payloads: (XyoPayload | undefined)[] = await Promise.all(
        this.payload.aliases?.map((alias) => {
          console.log(`Loading Alias: ${alias.huri}`)
          return new Huri(alias.huri, { archivistUri }).fetch()
        })
      )
      this.aliases = payloads.filter((payload) => payload !== undefined) as XyoPayload[]
    }
  }

  public async fetch(networkSlug?: string) {
    await this.fetchAliases(networkSlug)
    console.log(`After: ${JSON.stringify(this, null, 2)}`)
  }

  public static async discoverRootFileWithProxy(domain: string, proxy = 'https://api.archivist.xyo.network/domain') {
    try {
      console.log(`discoverRootFileWithProxy: ${domain}, ${proxy}`)
      const requestUrl = `${proxy}/${domain.split('.').reverse().join('.')}`
      console.log(`requestUrl: ${requestUrl}`)
      const config = await axios.get<XyoApiEnvelope<XyoDomainConfig>>(requestUrl)
      console.log(`CONFIG: ${JSON.stringify(config, null, 2)}`)
      return new XyoDomainConfigWrapper(config.data.data)
    } catch (ex) {
      const error = ex as AxiosError
      console.log(`XyoDomainConfig root file not found using proxy [${domain}] [${error.code}]`)
    }
  }

  public static async discoverRootFileDirect(domain: string) {
    try {
      const config = (await axios.get<XyoDomainConfig>(`https://${domain}/xyo-config.json`)).data
      return new XyoDomainConfigWrapper(config)
    } catch (ex) {
      console.log(`XyoDomainConfig root file not found [${domain}]`)
    }
  }

  public static async discoverRootFile(domain: string, proxy?: string) {
    return isBrowser() ? await this.discoverRootFileWithProxy(domain, proxy) : await this.discoverRootFileDirect(domain)
  }

  public static async discoverDNSEntry(domain: string) {
    try {
      const hash = (await domainResolve(`_xyo.${domain}`, DnsRecordType.TXT))?.Answer?.[0]?.data
      if (hash) {
        const huri = new Huri(hash)
        const payload = (await huri.fetch()) as XyoDomainConfig
        if (payload) {
          return new XyoDomainConfigWrapper(payload)
        }
      }
    } catch (ex) {
      console.log(`XyoDomainConfig dns reading error entry not found [${domain}]`)
    }
  }

  public static async discover(reverseDomainName: string, proxy?: string) {
    const parts = reverseDomainName.split('.')
    for (let i = 2; i <= parts.length; i++) {
      const domainToCheck = reverse(parts.filter((_, index) => index < i)).join('.')
      return (await this.discoverDNSEntry(domainToCheck)) ?? (await this.discoverRootFile(domainToCheck, proxy))
    }
  }
}
