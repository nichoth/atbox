import Router from '@substrate-system/routes'
import { TosRoute } from './tos.js'
import { HomeRoute } from './home.js'

export default function _Router ():InstanceType<typeof Router> {
    const router = new Router()

    router.addRoute('/', () => {
        return HomeRoute
    })

    router.addRoute('/tos', () => {
        return TosRoute
    })

    router.addRoute('/callback#:hash', () => {

    })

    return router
}
