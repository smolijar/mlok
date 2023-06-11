import { isMlok, mlok } from './index.js'
import { ClientRequest } from 'node:http'
import { jestExpect } from '@jest/expect'
import assert = require('assert')

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
})

describe('Jest compatibility', () => {
  const types = {
    function: mlok<(n: number) => {}>(),
    method: mlok<number[]>().includes,
  }
  for (const [label, fn] of Object.entries(types)) {
    const ITERATIONS = Array(10).keys()
    beforeEach(() => fn.reset())
    describe(label, () => {
      it('toHaveBeenCalled', () => {
        jestExpect(fn).not.toHaveBeenCalled()
        fn(1)
        jestExpect(fn).toHaveBeenCalled()
      })
      it('toHaveBeenCalledTimes', () => {
        for (const i of ITERATIONS) {
          jestExpect(fn).toHaveBeenCalledTimes(i)
          fn(1)
        }
      })
      it('toHaveBeenCalledWith', () => {
        jestExpect(fn).not.toHaveBeenCalledWith(1)
        fn(1)
        jestExpect(fn).toHaveBeenCalledWith(1)
      })
      it('toHaveBeenLastCalledWith', () => {
        for (const i of ITERATIONS) {
          jestExpect(fn).not.toHaveBeenLastCalledWith(i)
          fn(i)
          jestExpect(fn).toHaveBeenLastCalledWith(i)
        }
      })
      it('toHaveBeenNthCalledWith', () => {
        for (const i of ITERATIONS) {
          jestExpect(fn).not.toHaveBeenNthCalledWith(i + 1, i)
        }
        for (const i of ITERATIONS) {
          fn(i)
        }
        for (const i of ITERATIONS) {
          jestExpect(fn).toHaveBeenNthCalledWith(i + 1, i)
        }
      })
    })
  }
})
