import { test } from '@substrate-system/tapzero'
import { State } from '../src/state.js'

let state:ReturnType<typeof State>
test('state', async t => {
    state = State()
    t.ok(state, "Doesn't explode")
})

test('fetch the did record', async t => {
    t.plan(2)
    const did = await State.fetchDid(state, '@nichoth.com')
    t.ok(did, 'returned something')
    t.ok(did.id === 'did:plc:s53e6k6sirobjtz5s6vdddwr', 'should return my DID')
})

test('done', () => {
    // @ts-expect-error tests
    window.testsFinished = true
})
