type AnyObject = Record<string, unknown>

export function toCamelCase<T = any>(obj: T): T {
  if (Array.isArray(obj)) return obj.map(toCamelCase) as T
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj as object).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
      ;(acc as AnyObject)[camelKey] = toCamelCase((obj as AnyObject)[key])
      return acc
    }, {} as AnyObject) as T
  }
  return obj
}
