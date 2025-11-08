import { html } from 'htm/preact'
import { FunctionComponent } from 'preact'
import { State } from '../state.js'

interface AkaUpdateRouteProps {
    state:ReturnType<typeof State>
}

export const AkaUpdateRoute:FunctionComponent<AkaUpdateRouteProps> =
function AkaUpdateRoute (props) {
    const { state } = props

    async function handleInitialSubmit (ev:Event) {
        ev.preventDefault()
        await State.InitAkaUpdate(state)
    }

    async function handleCodeSubmit (ev:Event) {
        ev.preventDefault()
        await State.CompleteAkaUpdate(state)
    }

    function reset () {
        State.ResetAkaUpdate(state)
    }

    if (state.akaUpdate.step.value === 'success') {
        return html`<div class="route aka-update">
            <h2>Success! ✓</h2>
            <p class="success-message">
                Your DID document has been updated. The <code>alsoKnownAs</code> array now includes:
            </p>
            <ul class="aka-list">
                <li><code>at://${state.akaUpdate.handle.value}</code></li>
                <li><code>${state.akaUpdate.url.value}</code></li>
            </ul>
            <button class="button-outline" onClick=${reset}>
                Update Another
            </button>
        </div>`
    }

    if (state.akaUpdate.step.value === 'email-code') {
        return html`<div class="route aka-update">
            <h2>Email Verification</h2>
            <p class="description">
                A verification code has been sent to your email. Please enter it below.
            </p>

            <form onSubmit=${handleCodeSubmit}>
                <div class="form-group">
                    <label for="emailCode">Verification Code</label>
                    <input
                        id="emailCode"
                        type="text"
                        placeholder="Enter code from email"
                        value=${state.akaUpdate.emailCode.value}
                        onInput=${(e:any) => {
                            State.SetAkaEmailCode(state, e.target.value)
                        }}
                        required
                    />
                </div>

                ${state.akaUpdate.error.value ? html`<div class="error">
                    <strong>Error:</strong> ${state.akaUpdate.error.value}
                </div>` : null}

                <button
                    type="submit"
                    class="button-outline"
                    disabled=${state.akaUpdate.loading.value}
                >
                    ${state.akaUpdate.loading.value ? 'Verifying...' : 'Verify & Update'}
                </button>
                <button
                    type="button"
                    class="button-outline button-secondary"
                    onClick=${reset}
                    disabled=${state.akaUpdate.loading.value}
                >
                    Cancel
                </button>
            </form>
        </div>`
    }

    return html`<div class="route aka-update">
        <h2>Update alsoKnownAs</h2>
        <p class="description">
            Add a URL to your DID document's <code>alsoKnownAs</code> property.
            Link external identities like GitHub, personal websites, or other platforms to your Bluesky DID.
        </p>

        <form onSubmit=${handleInitialSubmit}>
            <div class="form-group">
                <label for="handle">Bluesky Handle</label>
                <input
                    id="handle"
                    type="text"
                    placeholder="e.g., alice.bsky.social"
                    value=${state.akaUpdate.handle.value}
                    onInput=${(e:any) => {
                        State.SetAkaHandle(state, e.target.value)
                    }}
                    required
                />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input
                    id="password"
                    type="password"
                    placeholder="Your Bluesky password"
                    value=${state.akaUpdate.password.value}
                    onInput=${(e:any) => {
                        State.SetAkaPassword(state, e.target.value)
                    }}
                    required
                />
                <small>Your password is sent directly to your PDS and is not stored.</small>
            </div>

            <div class="form-group">
                <label for="url">URL to Add</label>
                <input
                    id="url"
                    type="url"
                    placeholder="e.g., https://github.com/alice"
                    value=${state.akaUpdate.url.value}
                    onInput=${(e:any) => {
                        State.SetAkaUrl(state, e.target.value)
                    }}
                    required
                />
            </div>

            ${state.akaUpdate.error.value ? html`<div class="error">
                <strong>Error:</strong> ${state.akaUpdate.error.value}
            </div>` : null}

            <button
                type="submit"
                class="button-outline"
                disabled=${state.akaUpdate.loading.value}
            >
                ${state.akaUpdate.loading.value ?
                    'Requesting verification...' :
                    'Request Verification Code'}
            </button>
        </form>
    </div>`
}
