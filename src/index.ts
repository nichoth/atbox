import { html } from 'htm/preact'
import { FunctionComponent, render } from 'preact'
import { createDebug } from '@substrate-system/debug'
import { State } from './state.js'
import Router from './routes/index.js'
import '@substrate-system/css-normalize'
import '@substrate-system/a11y'
import './style.css'

const state = State()
const router = Router()
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
            <${ChildNode} state=${state} params=${match.params} />
        </main>
    </div>`
}

render(html`<${App} state=${state} />`, document.getElementById('root')!)
