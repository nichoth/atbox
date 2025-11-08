import { html } from 'htm/preact'
import Router from '@substrate-system/routes'
import { HomeRoute } from './home.js'
import { DidLookupRoute } from './did-lookup.js'
import { AkaUpdateRoute } from './aka-update.js'
import { State } from '../state.js'

export default function _Router (
    state:ReturnType<typeof State>
):InstanceType<typeof Router> {
    const router = new Router()

    router.addRoute('/', () => {
        return () => html`<${HomeRoute} />`
    })

    router.addRoute('/did-lookup', () => {
        return () => html`<${DidLookupRoute} state=${state} />`
    })

    router.addRoute('/aka-update', () => {
        return () => html`<${AkaUpdateRoute} state=${state} />`
    })

    return router
}
