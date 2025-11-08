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

    const input = useCallback((ev:InputEvent) => {
        const input = ev.target as HTMLInputElement
        const value = input.value
        pendingInput.value = value
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
                    <input name="did" id="did" type="text" onInput=${input} />

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

                ${state.didLookup.didDoc.value ?
                    html`<pre class="${['did', isResolving.value ? 'resolving' : ''].filter(Boolean).join(' ')}">
                        ${JSON.stringify(state.didLookup.didDoc.value, null, 2)}
                    </pre>` :
                    null
                }
            </div>

            <div class="feature-card">
                <h2><code>alsoKnownAs</code></h2>
                <p>
                    Link external identities to your Bluesky DID document.
                    Add URLs like GitHub profiles, personal websites, or other platforms.
                </p>
                <a href="/aka-update" class="button-outline">
                    Update AKA
                </a>
            </div>
        </div>
    </div>`
}
