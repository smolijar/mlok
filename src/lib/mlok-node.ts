import { createMlokFn } from './mlok-fn.js'
import { MlokatkoTree } from './mlokatko-map.js'

export const isMlok: unique symbol = Symbol('isMlok')

export type Override = Record<any, any>

export const mlokNode = <T>(overrides: Override) => {
  const tree = new MlokatkoTree<MlokRoot<any>>()
  const fn = createMlokFn((...args: any[]) => {
    return tree.addCall(args, mlokNode(overrides))
  })

  const mlokApiObject = {
    reset: () => {
      tree.clear()
    },
    override: (overridesMap: Override) => {
      return mlokNode(overridesMap)
    },
    [isMlok]: true,
    // Awaitable
    then: (resolve: () => void) => {
      resolve()
    },
    // Jest: causes isSpy to false, using the nested prop, e.g. `mock.calls` instead of `calls` directly
    calls: { all: null },
    // Vitest + Jest
    _isMockFunction: true,
    mock: tree,
    getMockName: () => 'MlokFn',
  }

  const proxy: any = new Proxy(fn, {
    get: (_target, prop) => {
      // @ts-expect-error
      const value = mlokApiObject[prop] ?? overrides[prop]
      return value ?? tree.getOrCreateProp(prop, mlokNode(overrides))
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
  Overrides extends Override = {},
  _MlokedInterfaceKeys extends keyof MlokedInterface = keyof MlokedInterface,
  ResultType = MlokedInterface extends (...args: infer A) => infer R
    ? (...args: A) => Mlok<Exclude<R, undefined>, Overrides>
    : {
        [k in _MlokedInterfaceKeys]: Mlok<MlokedInterface[k], Overrides>
      }
> = Overrides & MlokNodeExtension & ResultType & MlokedInterface

export type MlokRoot<
  MlokedInterface,
  ResultType = Mlok<MlokedInterface>
> = ResultType & {
  override: <O extends Record<any, any>>(
    overridesMap: O
  ) => Mlok<MlokedInterface, O>
}
