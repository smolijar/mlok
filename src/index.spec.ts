import { isMlok, mlok } from './index.js'
import { ClientRequest } from 'node:http'
import assert from 'assert'
import { jestExpect } from '@jest/expect'
import { run } from './test/jest-api-suite.test.js'

describe('Mlok', () => {
  it('Complex chaining does not fail', () => {
    const reqMock = mlok<ClientRequest>()
    reqMock
      .getHeaderNames()
      .filter(x => x)
      .at(1)
      ?.toLocaleLowerCase()
      .padEnd(20)[3]
      .charAt(1)
  })
  describe('Mlok object API in the hierarchy', () => {
    const req = mlok<ClientRequest>()
    for (const [name, mlokNode] of Object.entries({
      'Top level interface': req,
      Method: req.getMaxListeners,
      'Method call': req.getMaxListeners(),
      Array: req.getHeaders(),
      'Array index access': req.getHeaders()[1],
      'Number (Array length)': req.getHeaders().length,
      'Top level function': mlok<() => {}>(),
      'Top level function call': mlok<() => {}>()(),
    })) {
      it(`${name} - ${isMlok.toString()} true`, () => {
        assert(mlokNode[isMlok])
      })
    }
  })
  describe('.override', () => {
    it('nested property', () => {
      const reqMock = mlok<ClientRequest>().override({
        authorization: 'foo',
      } as const)
      const foo: 'foo' = reqMock.getHeaders().authorization
      assert(foo === 'foo')
    })

    it('overrides all occurrences', () => {
      const length42Array = mlok<any[]>().override({
        length: 42,
      } as const)
      for (const x of [length42Array.length, length42Array.sort().length]) {
        const l: 42 = x
        assert(l === 42)
      }
    })

    it('is immutable (override creates a new instance)', () => {
      const reqMock = mlok<ClientRequest>()
      const reqMockOverridden = reqMock.override({
        authorization: 'foo',
      } as const)
      // @ts-expect-error is string | number | string[]
      const foo: string = reqMock.getHeaders().authorization
      assert(foo !== 'foo')

      const foo2: 'foo' = reqMockOverridden.getHeaders().authorization
      assert(foo2 === 'foo')
    })

    it('overriding return (direct)', () => {
      const fnMock = mlok<() => string>().override(() => 'foo' as const)
      const foo: 'foo' = fnMock()
      assert(foo === 'foo')
    })

    it('overriding return (method)', () => {
      const reqMock = mlok<ClientRequest>().override({
        getHeaders: () => 'foo',
      } as const)
      const foo: 'foo' = reqMock.getHeaders()
      assert(foo === 'foo')
    })
  })
  describe('Is awaitable', () => {
    const asyncTest = mlok<{ test: () => Promise<string> }>()
    it('interface', async () => {
      await asyncTest
    })
    it('method call', async () => {
      await asyncTest.test()
    })
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

run({ beforeEach, describe, expect: jestExpect, it } as any)
