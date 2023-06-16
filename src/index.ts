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

class MlokatkoTree {
  readonly #props = new Map<Property, MlokRoot<any>>()
  readonly #calls = new Array<{ args: Args; result: Result }>()

  // TODO: Rename, does not override
  public getOrCreateProp(property: Property, createValue: MlokRoot<any>) {
    const value = this.#props.get(property) || createValue
    this.#props.set(property, value)
    return value
  }

  public addCall(args: Args, value: MlokRoot<any>) {
    this.#calls.push({ args, result: { type: ResultType.Return, value } })
    return value
  }

  public clear() {
    this.#props.clear()
    this.#calls.length = 0
  }

  get calls() {
    return this.#calls.map(c => c.args)
  }

  get results(): Result[] {
    return this.#calls.map(c => c.result)
  }
}

export const mlok = <T>() => mlokNode<T>({})
export const mlokNode = <T>(overrides: Record<any, any>) => {
  let tree = new MlokatkoTree()
  const fn = (...args: any[]) => {
    return tree.addCall(args, mlokNode(overrides))
  }
  Object.defineProperty(fn, 'name', {
    writable: true,
    value: 'MlokFn',
  })

  const passThrough = {
    reset: () => {
      tree.clear()
    },
    override: (overridesMap: Record<any, any>) => {
      return mlokNode(overridesMap)
    },
    [isMlok]: true,
    then: (resolve: () => void) => {
      resolve()
    },
    // Jest
    // causes isSpy to false, using the mock property instead
    calls: { all: null },
    // Vitest + Jest
    _isMockFunction: true,
    mock: tree,
    getMockName: () => 'MlokFn',
  }

  const proxy: any = new Proxy(fn, {
    get: (_target, prop) => {
      if (prop in passThrough || prop in overrides) {
        // @ts-expect-error
        return passThrough[prop] ?? overrides[prop]
      }
      return tree.getOrCreateProp(prop, mlokNode(overrides))
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
