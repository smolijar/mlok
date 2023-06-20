import { expect, describe, it, beforeEach, jest } from '@jest/globals'
import { run } from './jest-api-suite.test.js'
import {
  AuthenticationService,
  UserRepository,
  ExecutionContext,
} from './demo-code.test.js'
import { IncomingMessage } from 'node:http'
run({ expect, describe, it, beforeEach } as any)

describe('Demo', () => {
  it('Jest', async () => {
    const ctx: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () =>
          ({ headers: { authorization: 'Bearer foo' } } as IncomingMessage),
      }),
    }
    const userRepository: UserRepository = {
      getUserById: jest.fn<any>(),
      getUserByToken: jest.fn<any>(),
    }
    await new AuthenticationService(userRepository).authenticate(ctx)
    expect(userRepository.getUserByToken).toHaveBeenCalledWith('foo')
  })
})
