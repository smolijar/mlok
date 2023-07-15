import { createMlokFn } from './mlok-fn.js'
import { MlokatkoTree } from './mlokatko-map.js'
import { makeThenableProxy } from './thenable-proxy.js'

export const isMlok: unique symbol = Symbol('isMlok')

type Primitive = string | number | boolean | symbol | bigint
export type AllowedOverride =
  | ((...args: any[]) => any)
  | Record<any, any>
  | Primitive

const isFn = (x: any): x is (...args: any[]) => any => {
  return typeof x === 'function'
}

const isPrimitive = (x: any): x is Primitive => {
  return typeof x !== 'object' && !isFn(x)
}
export const mlokNode = <T>(overrides: AllowedOverride) => {
  if (isPrimitive(overrides)) {
    return overrides
  }
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
    override: (overridesMap: AllowedOverride) => {
      return mlokNode(overridesMap)
    },
    [isMlok]: true,
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
  return makeThenableProxy(
    Object.assign(proxy, {
      _isMockFunction: true,
    }) as MlokRoot<T>
  )
}

type MlokNodeExtension = {
  [isMlok]: true
  reset: () => void
}

type Mlok<
  MlokedInterface,
  Override extends AllowedOverride = {},
  _MlokedInterfaceKeys extends keyof MlokedInterface = keyof MlokedInterface,
  MlokResultType = MlokedInterface extends (...args: infer A) => infer R
    ? (...args: A) => Mlok<Exclude<R, undefined>, Override>
    : {
        [k in _MlokedInterfaceKeys]: Mlok<MlokedInterface[k], Override>
      }
> = Override extends Function | object
  ? Override & MlokNodeExtension & MlokResultType & MlokedInterface
  : Override

export type MlokRoot<
  MlokedInterface,
  ResultType = Mlok<MlokedInterface>
> = ResultType & {
  override: <O extends AllowedOverride>(
    overridesMap: O
  ) => Mlok<MlokedInterface, O>
}
