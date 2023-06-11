class JestCalls<T extends any[] = any[]> extends Array<T> {
  count() {
    return this.length
  }
  all() {
    return this.map((args) => ({ args }))
  }
}

export const isMlok: unique symbol = Symbol('isMlok')

export const mlok = <T>() => mlokNode<T>({})
export const mlokNode = <T>(overrides: Record<any, any>) => {
  let children: Record<string | symbol, any> = {}
  const calls = new JestCalls()
  const fn = (...args: any[]) => {
    const token = JSON.stringify(args)
    calls.push(args)
    children[token] ||= mlokNode(overrides)
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
      return mlokNode(overridesMap)
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
      children[prop] ||= mlokNode(overrides)
      return children[prop]
    },
  })
  return proxy as MlokRoot<T>
}

type MlokLeafExtension = {
  [isMlok]: true
  reset: () => void
}
type Mlok<
  MlokedInterface,
  Overrides extends Record<any, any> = {},
  _MlokedInterfaceKeys extends keyof MlokedInterface = keyof MlokedInterface,
  ResultType = MlokedInterface extends (...args: infer A) => infer R
    ? (...args: A) => Mlok<Exclude<R, undefined>, Overrides>
    : {
        [k in _MlokedInterfaceKeys]: Mlok<MlokedInterface[k], Overrides>
      }
> = Overrides & MlokLeafExtension & ResultType

type MlokRoot<
  MlokedInterface,
  ResultType = Mlok<MlokedInterface>
> = ResultType & {
  override: <O extends Record<any, any>>(
    overridesMap: O
  ) => Mlok<MlokedInterface, O>
}
