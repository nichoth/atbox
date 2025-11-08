import { html } from 'htm/preact'
import { useCallback } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { useSignal } from '@preact/signals'
import Debug from '@substrate-system/debug'
import { Button } from '../components/button.js'
import { State } from '../state.js'
const debug = Debug(import.meta.env.DEV)

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
        const form = ev.target as HTMLFormElement
        const els = form.elements
        const aka = els['aka'].value
        const handle = els['handle'].value
        pendingAka.value = { aka, handle }
    }, [])

    return html`<div class="route home">
        <h1>At Box</h1>

        <p>
            Some nice tools for working with your Bluesky DID record.
        </p>

        <div class="container">
            <div class="feature-card">
                <h2>DID Lookup</h2>
                <p>
                    Fetch and view the record for any handle or DID string.
                </p>

                <form onSubmit=${fetchDid}>
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
                        id="handle"
                        placeholder="@alice.com"
                        name="handle"
                    />

                    <label for="aka">New text</label>
                    <input
                        name="aka"
                        id="aka"
                        type="text"
                        placeholder="foobar.com"
                    />

                    <p>
                        This will start an OAuth login & authorization.
                    </p>

                    <div class="controls">
                        <${Button}
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
