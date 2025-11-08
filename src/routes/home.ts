import { html } from 'htm/preact'
import { FunctionComponent } from 'preact'

export const HomeRoute:FunctionComponent = function HomeRoute () {
    return html`<div class="route home">
        <h1>At Box</h1>
        <p class="tagline">
            GUI for your DID
        </p>

        <div class="features">
            <div class="feature-card">
                <h2>DID Lookup</h2>
                <p>
                    Fetch and view the DID document for any AT Protocol handle or DID string.
                    See alsoKnownAs entries, verification methods, and service endpoints.
                </p>
                <a href="/did-lookup" class="button-outline">
                    Lookup DID →
                </a>
            </div>

            <div class="feature-card">
                <h2>Update alsoKnownAs</h2>
                <p>
                    Link external identities to your Bluesky DID document.
                    Add URLs like GitHub profiles, personal websites, or other platforms.
                </p>
                <a href="/aka-update" class="button-outline">
                    Update AKA →
                </a>
            </div>
        </div>
    </div>`
}
