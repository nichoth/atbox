// @ts-check
import 'dotenv/config'
import { writeFileSync } from 'fs'
import { join } from 'path'

// Use NGROK_URL environment variable for local development
// Otherwise use production URL
let origin = 'https://atbox.dev'
if (process.env.NGROK_URL) {
    console.log('** NGROK_URL **')
    origin = process.env.NGROK_URL
} else if (process.env.NODE_ENV === 'development' || process.env.DEV) {
    console.log('**is dev**')
    origin = 'https://amalia-indeclinable-gaye.ngrok-free.dev'
}

const clientId = `${origin}/client-metadata.json`

console.log('proc env', process.env.NODE_ENV)

const metadata = {
    client_id: clientId,
    client_name: 'At Box',
    client_uri: origin,
    logo_uri: `${origin}/logo.png`,
    tos_uri: `${origin}/tos`,
    policy_uri: `${origin}/policy`,
    redirect_uris: [`${origin}/callback`],
    scope: 'atproto transition:generic',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
    application_type: 'web',
    dpop_bound_access_tokens: true
}

// Write the metadata file
const outputPath = join('_public', 'client-metadata.json')
writeFileSync(outputPath, JSON.stringify(metadata, null, 4))
console.log(`Generated ${outputPath} for ${origin}`)
