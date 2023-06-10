import { isMlok, mlok } from './index'
import { ClientRequest } from 'node:http'
import { jestExpect } from '@jest/expect'
import assert = require('assert')

describe('Mlok', () => {
  it('Complex chaining does not fail', () => {
    const reqMock = mlok<ClientRequest>()
    reqMock.getHeaderNames().at(1)?.toUpperCase().padEnd(20)[3].charAt(1)
  })
  it('Mlok object in hierarchy (both type & value)', () => {
    const reqMock = mlok<ClientRequest>()
    assert(reqMock[isMlok])
    assert(reqMock.getMaxListeners()[isMlok])
    // @ts-expect-error TODO  type issue
    assert(reqMock.getRawHeaderNames().at(1).length[isMlok])
  })
  it('Override', () => {
    const reqMock = mlok<ClientRequest>()
    reqMock.override({ authorization: 'foo' })
    assert(reqMock.getHeaders().authorization === 'foo')
  })
})

describe('Jest compatibility', () => {
  const types = {
    function: mlok<(n: number) => {}>(),
    method: mlok<number[]>().includes,
  }
  for (const [label, fn] of Object.entries(types)) {
    beforeEach(() => fn.reset())
    describe(label, () => {
      it('toHaveBeenCalled', () => {
        jestExpect(fn).not.toHaveBeenCalled()
        fn(1)
        jestExpect(fn).toHaveBeenCalled()
      })
      it('toHaveBeenCalledTimes', () => {
        for (const i of Array(10).keys()) {
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
        for (const i of Array(10).keys()) {
          jestExpect(fn).not.toHaveBeenLastCalledWith(i)
          fn(i)
          jestExpect(fn).toHaveBeenLastCalledWith(i)
        }
      })
      it('toHaveBeenNthCalledWith', () => {
        for (const i of Array(10).keys()) {
          jestExpect(fn).not.toHaveBeenNthCalledWith(i + 1, i)
        }
        for (const i of Array(10).keys()) {
          fn(i)
        }
        for (const i of Array(10).keys()) {
          jestExpect(fn).toHaveBeenNthCalledWith(i + 1, i)
        }
      })
    })
  }
})
