import { html } from 'htm/preact'
import { useCallback } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { useSignal } from '@preact/signals'
import Debug from '@substrate-system/debug'
import { Button } from '../components/button.js'
import { State } from '../state.js'
const debug = Debug(import.meta.env.DEV)

export const NBSP = '\u00A0'

export const HomeRoute:FunctionComponent<{
    state:ReturnType<typeof State>
}> = function HomeRoute ({ state }) {
    const pendingInput = useSignal<null|string>(null)
    const isResolving = useSignal<boolean>(false)

    const fetchDid = useCallback(async (ev:SubmitEvent) => {
        ev.preventDefault()
        if (!pendingInput.value) return
        debug('fetch did')
        isResolving.value = true
        await State.fetchDid(state, pendingInput.value)
        isResolving.value = false
    }, [])

    /**
     * Set the aka string in the DID doc.
     */
    const isAkaResolving = useSignal<boolean>(false)
    const aka = useCallback(async (ev:SubmitEvent) => {
        ev.preventDefault()
        debug('submit aka')
        if (!pendingAka.value) return
        isAkaResolving.value = true
        await State.setAka(
            state,
            pendingAka.value.handle,
            pendingAka.value.aka,
        )
        isAkaResolving.value = false
    }, [])

    const isLoginResolving = useSignal<boolean>(false)

    const input = useCallback((ev:InputEvent) => {
        const input = ev.target as HTMLInputElement
        const value = input.value
        pendingInput.value = value
    }, [])

    const pendingAka = useSignal<{ aka:string, handle:string }>({
        aka: '',
        handle: ''
    })

    const akaInput = useCallback((ev:InputEvent) => {
        const form = ev.currentTarget as HTMLFormElement
        const els = form.elements
        const aka = els['aka'].value
        const handle = els['handle'].value
        pendingAka.value = { aka, handle }
    }, [])

    const oauth = useCallback(async (ev:SubmitEvent) => {
        ev.preventDefault()
        debug('login')
        const form = ev.target as HTMLFormElement
        const handle = form.elements['login-handle']
        isLoginResolving.value = true
        await State.oauthLogin(state, handle.value)
        isLoginResolving.value = false
    }, [])

    return html`<div class="route home">
        <h1>At Box</h1>

        <p>
            Some nice tools for working with your Bluesky DID record.
        </p>

        <form onSubmit=${oauth} class="oauth${isLoginResolving ? ' resolving' : ''}">
            <${Button}
                type="submit"
                class="btn"
                isSpinning=${isAkaResolving}
                disabled=${!pendingAka.value}
            >
                Login with OAuth
            <//>

            <label for="login-handle">
                Bluesky hanlde
                <input
                    id="login-handle"
                    name="login-handle"
                    required=${true}
                    type="text"
                    placeholder="@alice.com"
                />
            </label>
        </form>

        <hr />

        <div class="container">
            <div class="feature-card">
                <h2>DID Lookup</h2>
                <p>
                    Fetch and view the record for any handle or DID string.
                </p>

                <form onSubmit=${fetchDid}>
                    <label for="did">
                        Handle
                    </label>

                    <input
                        name="did"
                        id="did"
                        type="text"
                        placeholder="@alice.com"
                        onInput=${input}
                    />

                    <div class="controls">
                        <${Button}
                            isSpinning=${isResolving}
                            type="submit"
                            disabled=${!pendingInput.value}
                        >
                            Lookup
                        <//>
                    </div>
                </form>

                <pre
                    class="${['did', isResolving.value ? 'resolving' : ''].filter(Boolean).join(' ')}">
                    ${
                        state.didLookup.didDoc.value ?
                            JSON.stringify(state.didLookup.didDoc.value, null, 2) :
                            'null'}
                </pre>
            </div>

            <div class="feature-card">
                <h2><code>alsoKnownAs</code></h2>
                <p>
                    Link URLs to your Bluesky DID document.
                    Add new strings to the <code>alsoKnownAs</code> field
                    in the DID record.
                </p>

                <form class="aka" onSubmit=${aka} onInput=${akaInput}>
                    <label for="handle">Your handle</label>
                    <input
                        required=${true}
                        id="handle"
                        placeholder="@alice.com"
                        name="handle"
                    />

                    <label for="aka">New text</label>
                    <p id="aka-description">
                        Add the URLs you want to identify with, for example,${NBSP}
                        <code>https://github.com/alice</code>, if you are${NBSP}
                        <code>alice</code>. This should be a JSON string, as
                        shown in the current DID document.
                    </p>
                    <textarea
                        id="aka"
                        required=${true}
                        name="aka"
                        placeholder="${JSON.stringify(['at://alice.com', 'https://github.com/alice/']).replace(',', ', ')}"
                    >
                    
                    </textarea>

                    <p>
                        This will start an OAuth login & authorization.
                    </p>

                    <div class="controls">
                        <${Button}
                            type="submit"
                            class="btn"
                            isSpinning=${isAkaResolving}
                            disabled=${!pendingAka.value}
                        >
                            Update AKA
                        <//>
                    </div>
                </form>
            </div>
        </div>
    </div>`
}
