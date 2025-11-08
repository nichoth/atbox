import { Signal, signal } from '@preact/signals'
import Route from 'route-event'
import { AtpAgent } from '@atproto/api'

/**
 * Setup any state
 *   - routes
 *   - DID lookup state
 *   - AKA update state
 */
export function State ():{
    route:Signal<string>;
    count:Signal<number>;
    _setRoute:(path:string)=>void;
    // DID lookup state
    didLookup:{
        handle:Signal<string>;
        didDoc:Signal<any>;
        loading:Signal<boolean>;
        error:Signal<string | null>;
    };
    // AKA update state
    akaUpdate:{
        handle:Signal<string>;
        password:Signal<string>;
        url:Signal<string>;
        emailCode:Signal<string>;
        step:Signal<'form' | 'email-code' | 'success'>;
        loading:Signal<boolean>;
        error:Signal<string | null>;
        agent:Signal<AtpAgent | null>;
    };
} {  // eslint-disable-line indent
    const onRoute = Route()

    const state = {
        _setRoute: onRoute.setRoute.bind(onRoute),
        count: signal<number>(0),
        route: signal<string>(location.pathname + location.search),
        // DID lookup state
        didLookup: {
            handle: signal(''),
            didDoc: signal<any>(null),
            loading: signal(false),
            error: signal<string | null>(null)
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
        const newPath = path.replace('/template-ts-preact-htm/', '/')
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

State.Increase = function (state:ReturnType<typeof State>) {
    state.count.value++
}

State.Decrease = function (state:ReturnType<typeof State>) {
    state.count.value--
}

// DID Lookup actions
State.SetDidHandle = function (state:ReturnType<typeof State>, handle:string) {
    state.didLookup.handle.value = handle
}

State.LookupDid = async function (state:ReturnType<typeof State>) {
    if (!state.didLookup.handle.value.trim()) return

    state.didLookup.loading.value = true
    state.didLookup.error.value = null
    state.didLookup.didDoc.value = null

    try {
        let cleanHandle = state.didLookup.handle.value.trim()
        // Strip '@' prefix if present
        cleanHandle = cleanHandle.startsWith('@') ? cleanHandle.slice(1) : cleanHandle

        // Create an agent (no login needed for public operations)
        const agent = new AtpAgent({ service: 'https://bsky.social' })

        // Resolve handle to DID
        const response = await agent.resolveHandle({ handle: cleanHandle })
        const did = response.data.did

        // Fetch DID document
        let fetchedDoc:any
        if (did.startsWith('did:plc:')) {
            // Fetch from PLC directory
            const plcResponse = await fetch(`https://plc.directory/${did}`)
            fetchedDoc = await plcResponse.json()
        } else if (did.startsWith('did:web:')) {
            // Handle did:web
            const webPart = did.replace('did:web:', '').replace(':', '/')
            const webUrl = `https://${webPart}/.well-known/did.json`
            const webResponse = await fetch(webUrl)
            fetchedDoc = await webResponse.json()
        } else {
            throw new Error(`Unsupported DID method: ${did}`)
        }

        state.didLookup.didDoc.value = fetchedDoc
    } catch (err) {
        state.didLookup.error.value = err instanceof Error ?
            err.message :
            'Failed to fetch DID document'
    } finally {
        state.didLookup.loading.value = false
    }
}

// AKA Update actions
State.SetAkaHandle = function (state:ReturnType<typeof State>, handle:string) {
    state.akaUpdate.handle.value = handle
}

State.SetAkaPassword = function (state:ReturnType<typeof State>, password:string) {
    state.akaUpdate.password.value = password
}

State.SetAkaUrl = function (state:ReturnType<typeof State>, url:string) {
    state.akaUpdate.url.value = url
}

State.SetAkaEmailCode = function (state:ReturnType<typeof State>, code:string) {
    state.akaUpdate.emailCode.value = code
}

State.InitAkaUpdate = async function (state:ReturnType<typeof State>) {
    if (!state.akaUpdate.handle.value.trim() ||
        !state.akaUpdate.password.value ||
        !state.akaUpdate.url.value.trim()) {
        return
    }

    state.akaUpdate.loading.value = true
    state.akaUpdate.error.value = null

    try {
        // Step 1: Login
        const newAgent = new AtpAgent({ service: 'https://bsky.social' })
        await newAgent.login({
            identifier: state.akaUpdate.handle.value,
            password: state.akaUpdate.password.value
        })
        state.akaUpdate.agent.value = newAgent

        // Step 2: Request email code
        await newAgent.com.atproto.identity.requestPlcOperationSignature()

        state.akaUpdate.step.value = 'email-code'
        state.akaUpdate.password.value = '' // Clear password from memory
    } catch (err) {
        state.akaUpdate.error.value = err instanceof Error ?
            err.message :
            'Failed to initialize AKA update'
    } finally {
        state.akaUpdate.loading.value = false
    }
}

State.CompleteAkaUpdate = async function (state:ReturnType<typeof State>) {
    if (!state.akaUpdate.emailCode.value.trim() || !state.akaUpdate.agent.value) {
        return
    }

    state.akaUpdate.loading.value = true
    state.akaUpdate.error.value = null

    try {
        // Step 3: Sign and submit the PLC operation
        const alsoKnownAs = [
            `at://${state.akaUpdate.handle.value}`,
            state.akaUpdate.url.value
        ]

        const signed = await state.akaUpdate.agent.value.com.atproto.identity
            .signPlcOperation({
                token: state.akaUpdate.emailCode.value.trim(),
                alsoKnownAs
            })

        await state.akaUpdate.agent.value.com.atproto.identity.submitPlcOperation({
            operation: signed.data.operation
        })

        state.akaUpdate.step.value = 'success'
    } catch (err) {
        state.akaUpdate.error.value = err instanceof Error ?
            err.message :
            'Failed to complete AKA update'
    } finally {
        state.akaUpdate.loading.value = false
    }
}

State.ResetAkaUpdate = function (state:ReturnType<typeof State>) {
    state.akaUpdate.step.value = 'form'
    state.akaUpdate.handle.value = ''
    state.akaUpdate.password.value = ''
    state.akaUpdate.url.value = ''
    state.akaUpdate.emailCode.value = ''
    state.akaUpdate.error.value = null
    state.akaUpdate.agent.value = null
}
