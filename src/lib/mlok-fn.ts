export const createMlokFn = (cb: (...args: any[]) => void) => {
  const mlokFn = (...args: any[]) => {
    return cb(...args)
  }
  Object.defineProperty(mlokFn, 'name', {
    writable: true,
    value: 'MlokFn',
  })
  return mlokFn
}
