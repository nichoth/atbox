import { html } from 'htm/preact'
import { useCallback } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { Button } from '../components/button.js'
import { useSignal } from '@preact/signals'
import Debug from '@substrate-system/debug'
const debug = Debug(import.meta.env.DEV)

export const HomeRoute:FunctionComponent = function HomeRoute () {
    const pendingInput = useSignal<null|string>(null)
    const fetchDid = useCallback((ev:SubmitEvent) => {
        ev.preventDefault()
        debug('fetch did')
    }, [])

    const input = useCallback((ev:InputEvent) => {
        const input = ev.target as HTMLInputElement
        const value = input.value
        debug('input', value)
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
                    <input type="text" onInput=${input} />

                    <div class="controls">
                        <${Button}
                            type="submit"
                            disabled=${!pendingInput.value}
                        >
                            Lookup
                        <//>
                    </div>
                </form>
            </div>

            <div class="feature-card">
                <h2>Update alsoKnownAs</h2>
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
