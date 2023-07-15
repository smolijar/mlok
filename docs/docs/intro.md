---
sidebar_position: 1
---

# Intro

Mlok creates spy-able interfaces with a single call (full Jest/Vitest compatible):

```ts
const mockedRepository = mlok<CatRepository>()
mockedRepository.listStrayCats()
// Jest / Vitest
expect(userRepository.listStrayCats).toHaveBeenCalled()
```

With simple and powerful type-safe override API:

```ts
mlok<any[]>().override({ length: 42 } as const)
assert(length42Array.sort().length === 42)
//                            ^? actually type 42!
```

And impressive dynamic:

```ts
const containerFullOfMeows = mlok<MyServiceContainer>().override({
  name: 'Meow',
})

// FLuently access whatever your interface provides:
const cat = await containerFullOfMeows['catRepository'].getCatById(42)
const bestFriend = (await cat.findFriends()).find(c => c.isBest)
assert(bestFriend.name === 'Meow')
```
