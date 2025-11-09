import { html } from 'htm/preact'
import { useCallback, useEffect } from 'preact/hooks'
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

    // Check for existing session on mount
    useEffect(() => {
        State.checkSession(state)
    }, [])

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
    const akaSubmit = useCallback(async (ev:SubmitEvent) => {
        ev.preventDefault()
        debug('submit aka')
        const form = ev.target as HTMLFormElement
        const handle = form.elements['handle'].value
        const password = form.elements['password'].value
        const aka = form.elements['aka'].value

        await State.setAka(state, handle, password, aka)
    }, [])

    const confirmEmail = useCallback(async (ev:SubmitEvent) => {
        ev.preventDefault()
        debug('confirm email code')
        const form = ev.target as HTMLFormElement
        const code = form.elements['email-code'].value

        await State.confirmAkaUpdate(state, code)
    }, [])

    const isLoginResolving = useSignal<boolean>(false)

    const input = useCallback((ev:InputEvent) => {
        const input = ev.target as HTMLInputElement
        const value = input.value
        pendingInput.value = value
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

    const logout = useCallback(async (ev:Event) => {
        ev.preventDefault()
        debug('logout')
        await State.logout(state)
    }, [])

    return html`<div class="route home">
        <h1>At Box</h1>

        <p>
            Some nice tools for working with your Bluesky DID record.
        </p>

        <div class="oauth-section">
            ${state.oauth.value ? html`
                <div class="oauth-status success logged-in">
                    <p class="status-text">
                        Logged in as <strong>${state.oauth.value.sub}</strong>
                    </p>
                    <${Button}
                        onClick=${logout}
                        class="btn logout-btn"
                    >
                        Logout
                    <//>
                </div>
            ` : html`
                <form onSubmit=${oauth} class="oauth${isLoginResolving.value ? ' resolving' : ''}">
                    <${Button}
                        type="submit"
                        class="btn"
                        isSpinning=${isLoginResolving}
                        disabled=${!pendingInput.value}
                    >
                        Login with OAuth
                    <//>

                    <label for="login-handle">
                        Bluesky handle
                        <input
                            id="login-handle"
                            name="login-handle"
                            required=${true}
                            type="text"
                            placeholder="@alice.com"
                            onInput=${input}
                        />
                    </label>
                </form>
            `}
            <p>
                This OAuth login does nothing btw.
                It is just here to try things.
            </p>
        </div>

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

                <p>
                    Bluesky requires a password for this operation, OAuth-only
                    is not allowed. That means you do have to enter your
                    password on this site, which is not great. FWIW, I do not do
                    anything with your password. It is simply sent to Bluesky's
                    API server.
                </p>

                ${state.akaUpdate.step.value === 'form' && html`
                    <form class="aka" onSubmit=${akaSubmit}>
                        <label for="handle">Your handle</label>
                        <input
                            required=${true}
                            id="handle"
                            placeholder="@alice.com"
                            name="handle"
                        />

                        <label for="password">Password</label>
                        <input
                            required=${true}
                            id="password"
                            type="password"
                            placeholder="Your password"
                            name="password"
                        />

                        <label for="aka">
                            New URLs
                            <p id="aka-description">
                                Add the URLs you want to identify with, for example,${NBSP}
                                <code>https://github.com/alice</code>, if you are${NBSP}
                                <code>alice</code>. This should be a JSON array.
                            </p>

                            <p>
                                You will receive an email confirmation code.
                            </p>

                            <p class="warning">
                                This is a destructive operation. This will totally
                                replace the <code>alsoKnownAs</code> field in your
                                DID document.
                            </p>
                        </label>

                        <textarea
                            id="aka"
                            required=${true}
                            name="aka"
                            placeholder="${JSON.stringify(['at://alice.com', 'https://github.com/alice/']).replace(',', ', ')}"
                        ></textarea>

                        ${state.akaUpdate.error.value && html`
                            <p class="error">${state.akaUpdate.error.value}</p>
                        `}

                        <div class="controls">
                            <${Button}
                                type="submit"
                                class="btn"
                                isSpinning=${state.akaUpdate.loading}
                            >
                                Request Email Confirmation
                            <//>
                        </div>
                    </form>
                `}

                ${state.akaUpdate.step.value === 'email-code' && html`
                    <form class="aka email-confirm" onSubmit=${confirmEmail}>
                        <p>
                            Check your email for a confirmation code and enter it below.
                        </p>

                        <label for="email-code">Email confirmation code</label>
                        <input
                            required=${true}
                            id="email-code"
                            type="text"
                            name="email-code"
                            placeholder="123456"
                            autocomplete="off"
                        />

                        ${state.akaUpdate.error.value && html`
                            <p class="error">${state.akaUpdate.error.value}</p>
                        `}

                        <div class="controls">
                            <${Button}
                                type="submit"
                                class="btn"
                                isSpinning=${state.akaUpdate.loading}
                            >
                                Confirm & Update
                            <//>
                        </div>
                    </form>
                `}

                ${state.akaUpdate.step.value === 'success' && html`
                    <div class="success-message">
                        <p class="success">DID document updated successfully!</p>
                        <button
                            class="btn"
                            onClick=${() => { state.akaUpdate.step.value = 'form' }}
                        >
                            Update Again
                        </button>
                    </div>
                `}
            </div>
        </div>
    </div>`
}
