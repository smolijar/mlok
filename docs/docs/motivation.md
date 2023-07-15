---
sidebar_position: 3
---

# Motivation

Some things are difficult to mock. This difficulty often arises due to poor design on our part, but there are also cases where we have limited control over it, such as with frameworks or other third-party library APIs. So, how is such code tested?

1. **It's not** Often a pragmatic solution, ideally applied only to the residue of code that is no longer logically reducable or splittable.
2. **Uses real thing in an integration test** This approach works well in certain situations, such as when running tests against a dockerized database or a sandboxed service environment. However, it's not always available or efficient and test performance becomes an issue when overused.
3. **Write a complex mock and a unit test** Requires lot of effort and resulting mocks are usually highly coupled with the implementation.

While unit tests are not the only type of testing to do, it should be the easiest. Mlok enables you to write mocks for complex inputs (like Request object, database connection, SDK instance) with the same ease as passing in a number or string. Stop worrying about creating mocks that "don't crash", focus on the behavior specific to your tests. Stop saying _something is not tested, because..._

### Example

In the simple snippet an `AuthenticationService` gets a `UserRepository` injected. Then it is able to provide a `User` from the repository based on the bearer token provided from the HTTP request from the Nest.js-like context.

```ts
export class AuthenticationService {
  constructor(private readonly userRepository: UserRepository) {}

  public async authenticate(ctx: ExecutionContext): Promise<User | null> {
    const token = this.extractJWT(ctx)
    if (!token) {
      return null
    }
    return this.userRepository.getUserByToken(token)
  }

  private extractJWT(ctx: ExecutionContext): string | null {
    const [, token] =
      ctx
        .switchToHttp()
        .getRequest()
        .headers.authorization?.toString()
        ?.match(/bearer (.*)/i) ?? []
    return token ?? null
  }
}
```

Let's write a small test: _When request sends bearer token foo, user is retrieved by the token._ It does not test all the logic, but it focuses on the token extraction and communication with the repository. Let's implement the tests in Jest.

#### Jest

```ts
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
```

- 💔 Lot of explicit code needs to be implemented "not to crash" (`ctx` needs to return object with callable `switchToHttp`, needs to return object with callable `getRequest`, which needs to have property `headers`).

- 🙈 For rich interfaces, we need to either cast type (`as IncomingMessage`) or implement the whole behavior (`UserRepository`).

#### Jest with Mlok

```ts
it('Mlok', async () => {
  const userRepository = mlok<UserRepository>()
  const ctx = mlok<ExecutionContext>().override({ authorization: 'Bearer foo' })
  await new AuthenticationService(userRepository).authenticate(ctx)
  expect(userRepository.getUserByToken).toHaveBeenCalledWith('foo')
})
```

- 💚 Mock does not fail on default, all you need is `mlok<T>()`, no need to implement whole interface nor type cast
- ✅ Focus on what you need to test
