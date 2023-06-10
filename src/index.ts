class JestCalls<T extends any[] = any[]> extends Array<T> {
  count() {
    return this.length
  }
  all() {
    return this.map((args) => ({ args }))
  }
}

export const isMlok: unique symbol = Symbol('isMlok')

export const mlok = <T>() => mlokInternal<T>({})
export const mlokInternal = <T>(overrides: Record<any, any>) => {
  let children: Record<string | symbol, any> = {}
  const calls = new JestCalls()
  const fn = (...args: any[]) => {
    const token = JSON.stringify(args)
    calls.push(args)
    children[token] ||= mlokInternal(overrides)
    return children[token]
  }
  Object.defineProperty(fn, 'name', {
    writable: true,
    value: 'MlokFn',
  })

  const passThrough = {
    children,
    reset: () => {
      children = {}
      calls.length = 0
    },
    override: (overridesMap: Record<any, any>) => {
      Object.assign(overrides, overridesMap)
    },
    [isMlok]: true,
    // Jest
    calls,
  }

  const proxy: any = new Proxy(fn, {
    get: (_target, prop) => {
      if (prop in passThrough || prop in overrides) {
        // @ts-expect-error
        return passThrough[prop] ?? overrides[prop]
      }
      children[prop] ||= mlokInternal(overrides)
      return children[prop]
    },
  })
  return proxy as Mlok<T>
}

type E = {
  [isMlok]: true
  reset: () => void
  override: (overridesMap: Record<any, any>) => void
}
type Mlok<T, K extends keyof T = keyof T> = E &
  (T extends (...args: infer A) => infer R
    ? (...args: A) => Mlok<Exclude<R, undefined>>
    : T extends Record<any, any>
    ? {
        [k in K]: Mlok<T[k]>
      }
    : T)
