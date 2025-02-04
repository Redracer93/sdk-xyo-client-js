import 'source-map-support/register'

import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { asyncHandler, tryParseInt } from '@xylabs/sdk-api-express-ecs'
import { XyoDivinerWrapper } from '@xyo-network/diviner'
import { PayloadQueryPayload, PayloadQuerySchema } from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload'
import { RequestHandler } from 'express'

import { PayloadRecentPathParams } from './payloadRecentPathParams'

const handler: RequestHandler<PayloadRecentPathParams, (XyoPayload | null)[]> = async (req, res) => {
  const { archive, limit } = req.params
  const { payloadDiviner } = req.app
  const limitNumber = tryParseInt(limit) ?? 20
  assertEx(limitNumber > 0 && limitNumber <= 100, 'limit must be between 1 and 100')
  const query: PayloadQueryPayload = {
    archive,
    limit: limitNumber,
    order: 'desc',
    schema: PayloadQuerySchema,
  }
  const payloads = (await new XyoDivinerWrapper(payloadDiviner).divine([query])).filter(exists)
  res.json(payloads)
}

export const getArchivePayloadRecent = asyncHandler(handler)
