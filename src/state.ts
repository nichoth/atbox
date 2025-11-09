import { Signal, signal } from '@preact/signals'
import Route from 'route-event'
import { AtpAgent, Agent } from '@atproto/api'
import ky from 'ky'
import {
    BrowserOAuthClient,
    type OAuthSession,
    type DidDocument
} from '@atproto/oauth-client-browser'
import Debug from '@substrate-system/debug'
const debug = Debug(import.meta.env.DEV)

/**
 * Setup state
 */
export function State (pds = 'https://bsky.social'):{
    route:Signal<string>;
    count:Signal<number>;
    oauth:Signal<null|OAuthSession>;
    _pds:string;
    _setRoute:(path:string)=>void;
    // DID lookup state
    didLookup:{
        input:Signal<string>;
        didDoc:Signal<DidDocument>;
    };
    // AKA update state
    akaUpdate:{
        handle:Signal<string>;
        password:Signal<string>;
        url:Signal<string>;
        emailCode:Signal<string>;
        step:Signal<'form'|'email-code'|'success'>;
        loading:Signal<boolean>;
        error:Signal<string|null>;
        agent:Signal<Agent|null>;
    };
} {  // eslint-disable-line indent
    const onRoute = Route()

    const state = {
        _pds: pds,
        _setRoute: onRoute.setRoute.bind(onRoute),
        count: signal<number>(0),
        route: signal<string>(location.pathname + location.search),
        oauth: signal<null|OAuthSession>(null),
        // DID lookup state
        didLookup: {
            input: signal(''),
            didDoc: signal<any>(null),
        },
        // AKA update state
        akaUpdate: {
            handle: signal(''),
            password: signal(''),
            url: signal(''),
            emailCode: signal(''),
            step: signal<'form' | 'email-code' | 'success'>('form'),
            loading: signal(false),
            error: signal<string | null>(null),
            agent: signal<AtpAgent | null>(null)
        }
    }

    /**
     * set the app state to match the browser URL
     */
    onRoute((path:string, data) => {
        // for github pages
        const newPath = path.replace('/atbox/', '/')
        state.route.value = newPath
        // handle scroll state like a web browser
        // (restore scroll position on back/forward)
        if (data.popstate) {
            return window.scrollTo(data.scrollX, data.scrollY)
        }
        // if this was a link click (not back button), then scroll to top
        window.scrollTo(0, 0)
    })

    return state
}

State.fetchDid = async function (
    state:ReturnType<typeof State>,
    didInput:string,
    pds?:string
):Promise<DidDocument> {
    const agent = new AtpAgent({ service: pds || state._pds })

    // Strip '@' prefix if present
    didInput = didInput.startsWith('@') ? didInput.slice(1) : didInput

    // Resolve handle to DID
    // const response = await agent.resolveHandle({ handle })
    // const did = response.data.did
    const did = didInput.includes('did:') ?
        didInput :
        (await agent.resolveHandle({ handle: didInput })).data.did

    // Fetch DID document
    let didDoc:DidDocument
    if (did.startsWith('did:plc:')) {
        // Fetch from PLC directory
        // const plcResponse = await fetch(`https://plc.directory/${did}`)
        // didDoc = await plcResponse.json()
        didDoc = await ky.get(`https://plc.directory/${did}`).json()
    } else if (did.startsWith('did:web:')) {
        // Handle did:web
        const webPart = did.replace('did:web:', '').replace(':', '/')
        const webUrl = `https://${webPart}/.well-known/did.json`
        didDoc = await ky.get(webUrl).json()
    } else {
        throw new Error(`Unsupported DID method: ${did}`)
    }

    state.didLookup.didDoc.value = didDoc

    return didDoc
}

State.oauthLogin = async function (
    state:ReturnType<typeof State>,
    handleOrDid:string,
    pds?:string
) {
    const origin = import.meta.env.DEV ?
        'https://amalia-indeclinable-gaye.ngrok-free.dev' :
        location.origin

    const clientId = `${origin}/client-metadata.json`

    debug('**client id**', clientId)

    const client = new BrowserOAuthClient({
        handleResolver: pds || state._pds,
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

    // Initialize and check for existing session
    const result:undefined|{
        session:OAuthSession;
        state?:string|null
    } = await client.init()

    let session:OAuthSession
    if (result) {
        // session exists
        session = result.session
        debug(`${session.sub} was restored`)

        const { state } = result
        if (state) {
            debug(
                `${session.sub} was successfully authenticated (state: ${state})`,
            )
        } else {
            debug(`${session.sub} was restored (last active session)`)
        }
    } else {
        // No existing session, need to sign in
        try {
            // Strip '@' prefix if present
            const cleanHandle = handleOrDid.startsWith('@') ?
                handleOrDid.slice(1) :
                handleOrDid

            debug('Attempting to sign in with handle:', cleanHandle)
            debug('Handle resolver:', pds || state._pds)
            debug('Origin:', origin)
            await client.signIn(cleanHandle, {
                state: 'setting-aka',
            })
            // Page will redirect
        } catch (err) {
            debug('Sign in failed:', err)
            console.error('Full error:', err)
            throw new Error('Authentication failed: ' + err)
        }
    }
}

State.setAka = async function (
    state:ReturnType<typeof State>,
    handleOrDid:string,
    password:string,
    newText:string
):Promise<void> {
    state.akaUpdate.loading.value = true
    state.akaUpdate.error.value = null

    const cleanHandle = handleOrDid.startsWith('@') ?
        handleOrDid.slice(1) :
        handleOrDid

    let newUrls:string[]
    try {
        newUrls = JSON.parse(newText)
    } catch (err) {
        debug('invalid JSON...', err)
        state.akaUpdate.error.value = 'Invalid JSON format'
        state.akaUpdate.loading.value = false
        throw err
    }

    try {
        // Login with handle and password
        const atpAgent = new AtpAgent({ service: state._pds })
        await atpAgent.login({ identifier: cleanHandle, password })

        debug('Logged in as:', atpAgent.session?.did)

        // Store the AtpAgent (NOT Agent) and URLs for later use
        // We need to keep the AtpAgent because it has the authenticated session
        state.akaUpdate.agent.value = atpAgent as any
        state.akaUpdate.url.value = JSON.stringify(newUrls)

        // Request email confirmation
        await atpAgent.com.atproto.identity.requestPlcOperationSignature()
        debug('Email confirmation requested')

        // Move to email confirmation step
        state.akaUpdate.step.value = 'email-code'
        state.akaUpdate.loading.value = false
    } catch (err) {
        debug('Failed to request email confirmation:', err)
        state.akaUpdate.error.value = (err as Error).message || 'Failed to authenticate or request confirmation'
        state.akaUpdate.loading.value = false
        throw err
    }
}

/**
 * Complete the AKA update with email confirmation code
 */
State.confirmAkaUpdate = async function (
    state:ReturnType<typeof State>,
    emailCode:string
):Promise<void> {
    state.akaUpdate.loading.value = true
    state.akaUpdate.error.value = null

    const atpAgent = state.akaUpdate.agent.value as any as AtpAgent
    if (!atpAgent || !atpAgent.session) {
        state.akaUpdate.error.value = 'No active session'
        state.akaUpdate.loading.value = false
        throw new Error('No active session')
    }

    try {
        // Parse the URLs
        const newUrls:string[] = JSON.parse(state.akaUpdate.url.value)

        // Get current DID document
        const didDoc:DidDocument = await ky.get(
            `https://plc.directory/${atpAgent.session.did}`
        ).json()

        // Sign the PLC operation with email token
        const signedOpResponse = await atpAgent.com.atproto.identity.signPlcOperation({
            token: emailCode,
            ...didDoc,
            alsoKnownAs: Array.from(new Set(newUrls))  // deduplicate
        })

        // Submit the signed operation
        await atpAgent.com.atproto.identity.submitPlcOperation(signedOpResponse.data)

        debug('DID document updated successfully')
        state.akaUpdate.step.value = 'success'
        state.akaUpdate.loading.value = false
    } catch (err) {
        debug('Failed to update DID document:', err)
        state.akaUpdate.error.value = (err as Error).message || 'Failed to update'
        state.akaUpdate.loading.value = false
        throw err
    }
}

/**
 * Check if there's an active OAuth session and update state
 */
State.checkSession = async function (state:ReturnType<typeof State>):Promise<void> {
    const origin = import.meta.env.DEV ?
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
    if (result) {
        state.oauth.value = result.session
        debug('Session found:', result.session.sub)
    } else {
        state.oauth.value = null
    }
}

/**
 * Logout from OAuth session
 */
State.logout = async function (state:ReturnType<typeof State>):Promise<void> {
    if (!state.oauth.value) {
        debug('No active session to logout from')
        return
    }

    const origin = import.meta.env.DEV ?
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

    try {
        // Initialize client to restore the session
        const result = await client.init()
        if (result) {
            // Revoke the session
            await client.revoke(result.session.sub)
            debug('Session revoked:', result.session.sub)
        }
    } catch (err) {
        debug('Error during logout:', err)
        // Continue to clear local state even if revoke fails
    }

    // Clear local state regardless
    state.oauth.value = null
    debug('Logged out')
}
