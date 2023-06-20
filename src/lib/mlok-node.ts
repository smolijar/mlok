import { createMlokFn } from './mlok-fn.js'
import { MlokatkoTree } from './mlokatko-map.js'

export const isMlok: unique symbol = Symbol('isMlok')

export type Override = ((...args: any[]) => any) | Record<any, any>

const isFn = (x: any): x is (...args: any[]) => any => {
  return typeof x === 'function'
}

export const mlokNode = <T>(overrides: Override) => {
  const tree = new MlokatkoTree<MlokRoot<any>>()
  const fn = createMlokFn((...args: any[]) => {
    return tree.addCall(
      args,
      isFn(overrides) ? overrides(...args) : mlokNode(overrides)
    )
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
      const overriddenProp = overrides[prop]
      // @ts-expect-error
      const mlokApiProp = mlokApiObject[prop]
      const immediateReturnValue =
        mlokApiProp ?? (!isFn(overriddenProp) ? overriddenProp : null)
      return (
        immediateReturnValue ??
        tree.getOrCreateProp(
          prop,
          isFn(overriddenProp) ? mlokNode(overriddenProp) : mlokNode(overrides)
        )
      )
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
