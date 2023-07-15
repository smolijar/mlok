export const makeThenableProxy = <T extends object>(x: T) => {
  // This avoids infinite recursion
  const unThenableWrap = new Proxy(x, {
    get: (_, prop) => {
      if (prop === 'then') {
        return null
      }
      // @ts-expect-error
      return x[prop]
    },
  })
  return new Proxy(unThenableWrap, {
    get: (_, prop) => {
      if (prop === 'then') {
        return (resolve: (_: any) => void) => {
          resolve(unThenableWrap)
        }
      }
      // @ts-expect-error
      return unThenableWrap[prop]
    },
  }) as T
}
