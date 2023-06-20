import { MlokRoot, mlokNode } from './mlok-node.js'

/**
 * Create mock implementation of an interface for testing
 * @example
 * ```ts
 * const mock = mlok<MyInterface>()
 * ```
 * @example
 * ```ts
 * const mock = mlok<MyInterface>().override({ foo: 'bar' })
 * mock.foo // 'bar'
 * mock.myMethod().foo // 'bar'
 * ```
 * @returns Mocked interface
 */
export const mlok = <T>() => mlokNode<T>({}) as MlokRoot<T>
