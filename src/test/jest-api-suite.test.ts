import mlok from '../index.js'
import type { expect, describe, it, beforeEach } from 'vitest'
import Express from 'express'
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
      function: mlok<(n: number) => {}>().override((n: number) => n ** 2),
      method: mlok<number[]>().override({ includes: (n: number) => n ** 2 })
        .includes,
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
        it('toHaveReturnedWith', () => {
          expect(fn).not.toHaveReturnedWith(1)
          fn(1)
          expect(fn).toHaveReturnedWith(1)
        })
        it('toHaveLastReturnedWith', () => {
          for (const i of ITERATIONS) {
            expect(fn).not.toHaveLastReturnedWith(i)
            fn(i)
            expect(fn).toHaveLastReturnedWith(i * i)
          }
        })
        it('toHaveNthReturnedWith', () => {
          for (const i of ITERATIONS) {
            expect(fn).not.toHaveNthReturnedWith(i + 1, i)
          }
          for (const i of ITERATIONS) {
            fn(i)
          }
          for (const i of ITERATIONS) {
            expect(fn).toHaveNthReturnedWith(i + 1, i * i)
          }
        })
      })
    }
  })

  describe('Demo', () => {
    it('Mlok', async () => {
      const userRepository = mlok<UserRepository>()
      const ctx = mlok<ExecutionContext>().override({
        authorization: 'Bearer foo',
      })
      await new AuthenticationService(userRepository).authenticate(ctx)
      expect(userRepository.getUserByToken).toHaveBeenCalledWith('foo')
    })
    it('CatRepository', async () => {
      type MyServiceContainer = {
        catRepository: {
          getCatById(id: number): {
            findFriends(): { name: string; isBest: boolean }[]
          }
        }
      }
      const OVERRIDES = { name: 'Meow' } as const
      const containerFullOfMeows =
        mlok<MyServiceContainer>().override(OVERRIDES)

      const cat = await containerFullOfMeows['catRepository'].getCatById(42)
      const bestFriend = (await cat.findFriends()).find(c => c.isBest)
      const name: 'Meow' = bestFriend.name
      expect(name === 'Meow')
    })
    it('Express', async () => {
      const app = mlok<Express.Application>()
      const port = 1234
      app.get('/', (req, res) => {
        res.send('Hello World!')
      })

      app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
      })
      expect(app.listen).toHaveBeenCalledWith(1234, expect.any(Function))
    })
  })
}
