export const isMlok: unique symbol = Symbol('isMlok')

type Property = string | symbol
type Args = any[]
enum FragmentType {
  Property = 'Property',
  Call = 'Call',
}
type Fragment =
  | { type: FragmentType.Property; value: string | symbol }
  | { type: FragmentType.Call; args: any[] }

enum ResultType {
  Throw = 'throw',
  Return = 'return',
}
type Result =
  | { type: ResultType.Return; value: any }
  | { type: ResultType.Throw }

class MlokatkoMap extends Map<Fragment, MlokRoot<any>> {
  upsertProp(property: Property, value: MlokRoot<any>) {
    return this.upsert({ type: FragmentType.Property, value: property }, value)
  }
  upsertCall(args: Args, value: MlokRoot<any>) {
    // TODO: push args/returns
    return this.upsert({ type: FragmentType.Call, args }, value)
  }
  private upsert(token: Fragment, value: MlokRoot<any>) {
    this.set(token, this.get(token) || value)
    return value
  }
  get calls() {
    return [...this.keys()]
      .map(token => {
        return token.type === FragmentType.Call ? token.args : undefined
      })
      .filter(x => x)
  }
  get results(): Result[] {
    return [...this.entries()]
      .map(([token, child]) => {
        return token.type === FragmentType.Call ? child : undefined
      })
      .filter(x => x)
      .map(child => ({ type: ResultType.Return, value: child }))
  }
}

export const mlok = <T>() => mlokNode<T>({})
export const mlokNode = <T>(overrides: Record<any, any>) => {
  let children = new MlokatkoMap()
  const fn = (...args: any[]) => {
    return children.upsertCall(args, mlokNode(overrides))
  }
  Object.defineProperty(fn, 'name', {
    writable: true,
    value: 'MlokFn',
  })

  const passThrough = {
    children,
    reset: () => {
      children.clear()
    },
    override: (overridesMap: Record<any, any>) => {
      return mlokNode(overridesMap)
    },
    [isMlok]: true,
    // Jest
    // causes isSpy to false, using the mock property instead
    calls: { all: null },
    // Vitest + Jest
    _isMockFunction: true,
    mock: children,
    getMockName: () => 'MlokFn',
  }

  const proxy: any = new Proxy(fn, {
    get: (_target, prop) => {
      if (prop in passThrough || prop in overrides) {
        // @ts-expect-error
        return passThrough[prop] ?? overrides[prop]
      }
      return children.upsertProp(prop, mlokNode(overrides))
    },
  })
  // _isMockFunction is used by vitest "in" check
  return Object.assign(proxy, { _isMockFunction: true }) as MlokRoot<T>
}

type MlokNodeExtension = {
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
> = Overrides & MlokNodeExtension & ResultType & MlokedInterface

type MlokRoot<
  MlokedInterface,
  ResultType = Mlok<MlokedInterface>
> = ResultType & {
  override: <O extends Record<any, any>>(
    overridesMap: O
  ) => Mlok<MlokedInterface, O>
}
