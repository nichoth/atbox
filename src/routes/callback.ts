import { type FunctionComponent } from 'preact'
import { html } from 'htm/preact'
import { useEffect } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import Debug from '@substrate-system/debug'
import {
    BrowserOAuthClient,
    type DidDocument
} from '@atproto/oauth-client-browser'
import { Agent } from '@atproto/api'
import ky from 'ky'
import { State } from '../state.js'
const debug = Debug(import.meta.env?.DEV)

export const CallbackRoute:FunctionComponent<{
    state:ReturnType<typeof State>;
    params:Record<string, string>;
}> = function ({ state, params }) {
    debug('callback route', state)
    debug('params', params)

    const status = useSignal<'loading'|'success'|'error'>('loading')
    const error = useSignal<string|null>(null)

    useEffect(() => {
        (async () => {
            try {
                const origin = import.meta.env?.DEV ?
                    'https://amalia-indeclinable-gaye.ngrok-free.dev' :
                    location.origin
                const clientId = `${origin}/client-metadata.json`

                const client = new BrowserOAuthClient({
                    handleResolver: state._pds,
                    clientMetadata: {
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
                    },
                })

                const result = await client.init()
                debug('result', result)
                if (result) {
                    debug('OAuth session established:', result.session.sub)
                    // Update state with session
                    state.oauth.value = result.session

                    // Check if we have a pending AKA update
                    const pendingUpdate = localStorage.getItem('pending-aka-update')
                    if (pendingUpdate && result.state === 'setting-aka') {
                        const { newUrl } = JSON.parse(pendingUpdate)
                        debug('Completing pending AKA update:', newUrl)

                        // Create Agent with the OAuth session
                        const agent = new Agent(result.session)

                        // Get current DID document to preserve existing data
                        const didDoc:DidDocument = await ky.get(
                            `https://plc.directory/${agent.assertDid}`).json()

                        // Sign a PLC operation to update alsoKnownAs
                        const signedOpResponse = await agent.com.atproto
                            .identity.signPlcOperation({
                                ...didDoc,
                                alsoKnownAs: Array.from(new Set([  // deduplicate
                                    ...(didDoc.alsoKnownAs || []),
                                    newUrl,
                                ])),
                            })

                        // Submit the signed operation
                        await agent.com.atproto.identity
                            .submitPlcOperation(signedOpResponse.data)

                        debug('DID document updated successfully')
                        localStorage.removeItem('pending-aka-update')
                    }

                    status.value = 'success'
                    // Redirect back to home after success
                    setTimeout(() => {
                        state._setRoute('/')
                    }, 2000)
                } else {
                    throw new Error('No session returned from OAuth callback')
                }
            } catch (err) {
                debug('OAuth callback error:', err)
                error.value = (err as Error).message || 'Authentication failed'
                status.value = 'error'
            }
        })()
    }, [])

    return html`<div class="route callback">
        ${status.value === 'loading' && html`
            <h2>Completing authentication...</h2>
            <p>Please wait while we process your login.</p>
        `}

        ${status.value === 'success' && html`
            <h2>Authentication successful!</h2>
            <p>Redirecting you back...</p>
        `}

        ${status.value === 'error' && html`
            <h2>Authentication failed</h2>
            <p class="error">${error.value}</p>
            <p>
                <a href="/">Return to home</a>
            </p>
        `}
    </div>`
}
