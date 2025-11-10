import Router from '@substrate-system/routes'
import { TosRoute } from './tos.js'
import { HomeRoute } from './home.js'
import { CallbackRoute } from './callback.js'
import Debug from '@substrate-system/debug'
const debug = Debug(import.meta.env?.DEV)

export default function _Router ():InstanceType<typeof Router> {
    const router = new Router()

    router.addRoute('/', () => {
        return HomeRoute
    })

    router.addRoute('/tos', () => {
        return TosRoute
    })

    router.addRoute('/callback#:hash', () => {
        debug('callback route matched')
        return CallbackRoute
    })

    return router
}
