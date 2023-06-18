import { mlok } from '../index.js'
import type { expect, describe, it, beforeEach } from 'vitest'
import {
  AuthenticationService,
  ExecutionContext,
  UserRepository,
} from './demo-code.test.js'

// Vitest types used because Jest types are unstable in older versions and would break integration tests
type JestApi = {
  expect: typeof expect
  describe: typeof describe
  it: typeof it
  beforeEach: typeof beforeEach
}

export const run = ({ expect, describe, it, beforeEach }: JestApi) => {
  describe('Jest API compatibility', () => {
    const types = {
      function: mlok<(n: number) => {}>(),
      method: mlok<number[]>().includes,
    }
    for (const [label, fn] of Object.entries(types)) {
      const ITERATIONS = Array(10).keys()
      beforeEach(() => fn.reset())
      describe(label, () => {
        it('toHaveBeenCalled', () => {
          expect(fn).not.toHaveBeenCalled()
          fn(1)
          expect(fn).toHaveBeenCalled()
          fn(1)
          expect(fn).toHaveBeenCalled()
        })
        it('toHaveBeenCalledTimes', () => {
          for (const i of ITERATIONS) {
            expect(fn).toHaveBeenCalledTimes(i)
            fn(1)
          }
        })
        it('toHaveBeenCalledWith', () => {
          expect(fn).not.toHaveBeenCalledWith(1)
          fn(1)
          expect(fn).toHaveBeenCalledWith(1)
        })
        it('toHaveBeenLastCalledWith', () => {
          for (const i of ITERATIONS) {
            expect(fn).not.toHaveBeenLastCalledWith(i)
            fn(i)
            expect(fn).toHaveBeenLastCalledWith(i)
          }
        })
        it('toHaveBeenNthCalledWith', () => {
          for (const i of ITERATIONS) {
            expect(fn).not.toHaveBeenNthCalledWith(i + 1, i)
          }
          for (const i of ITERATIONS) {
            fn(i)
          }
          for (const i of ITERATIONS) {
            expect(fn).toHaveBeenNthCalledWith(i + 1, i)
          }
        })
        it('toHaveReturned', () => {
          expect(fn).not.toHaveReturned()
          fn(1)
          expect(fn).toHaveReturned()
        })
        it('toHaveReturnedTimes', () => {
          for (const i of ITERATIONS) {
            expect(fn).not.toHaveReturnedTimes(i)
            fn(1)
          }
        })
        // it.todo('toHaveReturnedWith')
        // it.todo('toHaveLastReturnedWith')
        // it.todo('toHaveNthReturnedWith')
      })
    }
  })

  describe('Demo', () => {
    it('Mlok', async () => {
      const userRepository = mlok<UserRepository>()
      await new AuthenticationService(userRepository).authenticate(
        mlok<ExecutionContext>()
      )
      expect(userRepository.getUserByToken).not.toHaveBeenCalled()
    })
    it('Mlok', async () => {
      const userRepository = mlok<UserRepository>()
      const ctx = mlok<ExecutionContext>().override({
        authorization: 'Bearer foo',
      })
      await new AuthenticationService(userRepository).authenticate(ctx)
      expect(userRepository.getUserByToken).toHaveBeenCalledWith('foo')
    })
  })
}
