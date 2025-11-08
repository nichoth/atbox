import { Signal, signal } from '@preact/signals'
import Route from 'route-event'
import { AtpAgent } from '@atproto/api'
import ky from 'ky'
import { type DidDocument } from '@atproto/oauth-client-browser'

/**
 * Setup state
 */
export function State (pds = 'https://bsky.social'):{
    route:Signal<string>;
    count:Signal<number>;
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
        agent:Signal<AtpAgent|null>;
    };
} {  // eslint-disable-line indent
    const onRoute = Route()

    const state = {
        _pds: pds,
        _setRoute: onRoute.setRoute.bind(onRoute),
        count: signal<number>(0),
        route: signal<string>(location.pathname + location.search),
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

State.setAka = async function () {

}
