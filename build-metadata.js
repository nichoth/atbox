// @ts-check
import 'dotenv/config'
import { writeFileSync } from 'fs'
import { join } from 'path'

const origin = (process.env.NODE_ENV === 'development' || process.env.DEV) ?
    'http://127.0.0.1' :
    'https://atbox.dev'

const clientId = `${origin}/client-metadata.json`

const metadata = {
    client_id: clientId,
    client_name: 'At Box',
    client_uri: origin,
    logo_uri: `${origin}/logo.png`,
    tos_uri: `${origin}/tos`,
    policy_uri: `${origin}/policy`,
    redirect_uris: [`${origin}/callback`],
    scope: 'atproto',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
    application_type: 'web',
    dpop_bound_access_tokens: true
}

// Write the metadata file
const outputPath = join('public', 'client-metadata.json')
writeFileSync(outputPath, JSON.stringify(metadata, null, 4))
console.log(`Generated ${outputPath} for ${origin}`)
