import { html } from 'htm/preact'
import { FunctionComponent } from 'preact'
import { State } from '../state.js'

interface DidLookupRouteProps {
    state:ReturnType<typeof State>
}

export const DidLookupRoute:FunctionComponent<DidLookupRouteProps> =
function DidLookupRoute (props) {
    const { state } = props

    async function handleSubmit (ev:Event) {
        ev.preventDefault()
        await State.LookupDid(state)
    }

    return html`<div class="route did-lookup">
        <h2>DID Lookup</h2>
        <p class="description">
            Fetch the DID document for any AT Protocol handle or DID string.
        </p>

        <form onSubmit=${handleSubmit}>
            <div class="form-group">
                <label for="handle">Handle or DID</label>
                <input
                    id="handle"
                    type="text"
                    placeholder="e.g., alice.bsky.social or @alice.bsky.social"
                    value=${state.didLookup.handle.value}
                    onInput=${(e:any) => {
                        State.SetDidHandle(state, e.target.value)
                    }}
                    required
                />
            </div>

            <button
                type="submit"
                class="button-outline"
                disabled=${state.didLookup.loading.value}
            >
                ${state.didLookup.loading.value ? 'Looking up...' : 'Lookup DID'}
            </button>
        </form>

        ${state.didLookup.error.value ? html`<div class="error">
            <strong>Error:</strong> ${state.didLookup.error.value}
        </div>` : null}

        ${state.didLookup.didDoc.value ? html`<div class="result">
            <h3>DID Document</h3>
            <pre>${JSON.stringify(state.didLookup.didDoc.value, null, 2)}</pre>
        </div>` : null}
    </div>`
}
