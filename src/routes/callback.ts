import { type FunctionComponent } from 'preact'
import { html } from 'htm/preact'
import Debug from '@substrate-system/debug'
const debug = Debug(import.meta.env.DEV)

export const TosRoute:FunctionComponent<{ state, params }> = function ({
    state,
    params
}) {
    debug('callback route', state)
    debug('params', params)

    return html`<div class="route callback">
        callback
    </div>`
}
