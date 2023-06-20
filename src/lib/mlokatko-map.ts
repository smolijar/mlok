type Property = string | symbol
type Args = any[]

export enum ResultType {
  Throw = 'throw',
  Return = 'return',
}
type Result =
  | { type: ResultType.Return; value: any }
  | { type: ResultType.Throw }

export class MlokatkoTree<M> {
  readonly #props = new Map<Property, M>()
  readonly #calls = new Array<{ args: Args; result: Result }>()

  public getOrCreateProp(property: Property, createValue: M) {
    const value = this.#props.get(property) || createValue
    this.#props.set(property, value)
    return value
  }

  public addCall(args: Args, value: M) {
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
