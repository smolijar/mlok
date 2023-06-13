import { isMlok, mlok } from './index.js'
import { ClientRequest } from 'node:http'
import assert from 'assert'

describe('Mlok', () => {
  it('Complex chaining does not fail (both type & value)', () => {
    const reqMock = mlok<ClientRequest>()
    reqMock.getHeaderNames().at(1)?.toUpperCase().padEnd(20)[3].charAt(1)
  })
  it('Mlok object in hierarchy (both type & value)', () => {
    const reqMock = mlok<ClientRequest>()
    assert(reqMock[isMlok])
    assert(reqMock.getMaxListeners()[isMlok])
    assert(reqMock.getRawHeaderNames().at(1).length[isMlok])
  })
  it('Override (simple object)', () => {
    const reqMock = mlok<ClientRequest>().override({ authorization: 'foo' })
    assert(reqMock.getHeaders().authorization === 'foo')
  })
  it('Override (simple object, type override)', () => {
    const reqMock = mlok<ClientRequest>().override({
      authorization: 'foo',
    } as const)
    assert(reqMock.getHeaders().authorization === 'foo')
    const foo: 'foo' = reqMock.getHeaders().authorization
    assert(foo === 'foo')
  })
})

describe('Vitest', () => {
  it('isMockFunction', () => {
    const t = mlok<any>()
    assert(
      typeof t === 'function' && '_isMockFunction' in t && t._isMockFunction
    )
  })
})

describe('Jest', () => {
  const isMock = (received: any) =>
    received != null && received._isMockFunction === true
  const isSpy = (received: any) =>
    received != null &&
    received.calls != null &&
    typeof received.calls.all === 'function' &&
    typeof received.calls.count === 'function'

  it('ensureMockOrSpy', () => {
    const t = mlok<any>()
    assert(isMock(t) || isSpy(t))
  })

  it('isMock = true', () => {
    const t = mlok<any>()
    assert(isMock(t))
  })

  it('isSpy = false', () => {
    const t = mlok<any>()
    assert(!isSpy(t))
  })

  it('calls', () => {
    const t = mlok<(...ns: number[]) => {}>()
    t(1, 2, 3)
    // @ts-expect-error
    assert(t.mock.calls.length === 1)
    // @ts-expect-error
    assert.deepEqual(t.mock.calls[0], [1, 2, 3])
  })
})
