import { html } from 'htm/preact'
import { FunctionComponent, render } from 'preact'
import { createDebug } from '@substrate-system/debug'
import { State } from './state.js'
import Router from './routes/index.js'
import '@nichoth/components/button-outline.css'
import './style.css'

const state = State()
const router = Router(state)
const debug = createDebug(import.meta.env.DEV)

if (import.meta.env.DEV || import.meta.env.MODE === 'staging') {
    // @ts-expect-error DEV env
    window.state = state
}

export const App:FunctionComponent = function App () {
    debug('rendering app...')
    const match = router.match(state.route.value)

    if (!match || !match.action) {
        return html`<div class="404">
            <h1>404</h1>
            <p>Page not found</p>
            <a href="/">Go home</a>
        </div>`
    }

    const ChildNode = match.action(match, state.route.value)

    return html`<div class="app">
        <main>
            <${ChildNode} />
        </main>
    </div>`
}

render(html`<${App} />`, document.getElementById('root')!)
