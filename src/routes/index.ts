// import { html } from 'htm/preact'
import Router from '@substrate-system/routes'
import { HomeRoute } from './home.js'

export default function _Router ():InstanceType<typeof Router> {
    const router = new Router()

    router.addRoute('/', () => {
        return HomeRoute
    })

    return router
}
