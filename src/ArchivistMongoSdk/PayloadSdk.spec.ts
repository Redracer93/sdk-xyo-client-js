import { assertEx } from '@xyo-network/sdk-xyo-js'
import dotenv from 'dotenv'

import PayloadSdk from './PayloadSdk'

const getMongoSdk = (archive: string) => {
  dotenv.config()
  return new PayloadSdk(
    {
      collection: 'payloads',
      dbDomain: assertEx(process.env.MONGO_DOMAIN, 'Missing Mongo Domain'),
      dbName: assertEx(process.env.MONGO_DATABASE, 'Missing Mongo Database'),
      dbPassword: assertEx(process.env.MONGO_PASSWORD, 'Missing Mongo Password'),
      dbUserName: assertEx(process.env.MONGO_USERNAME, 'Missing Mongo Username'),
    },
    archive
  )
}

test('all', async () => {
  const sdk = getMongoSdk('test')
  const plan = await sdk.findRecentPlan(100)
  console.log(`Plan: ${JSON.stringify(plan, null, 2)}`)
})
