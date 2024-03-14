// Defines a type for the constructor of any class
import { consola } from 'consola'

type Constructor<T = any> = new (...args: any[]) => T

/**
 * A class decorator that wraps each method of the class to log the method name and its parameters when invoked.
 */
export function Log<T extends Constructor>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args)
      const className = constructor.name
      Object.getOwnPropertyNames(constructor.prototype).forEach((methodName) => {
        if (methodName !== 'constructor' && typeof this[methodName] === 'function') {
          const originalMethod = this[methodName] as Function
          const paramNames = getParamNames(originalMethod)

          this[methodName] = (...methodArgs: any[]) => {
            const argsWithNames = paramNames.reduce((obj, name, index) => {
              obj[name] = methodArgs[index]
              return obj
            }, {} as Record<string, any>)

            consola.withDefaults({ level: 5 }).withTag(className).debug(methodName, argsWithNames)

            return originalMethod.apply(this, methodArgs)
          }
        }
      })
    }
  }
}

/**
 * Extracts parameter names from a function.
 * @param func The function to extract parameter names from.
 * @returns An array of parameter names.
 */
function getParamNames(func: Function): string[] {
  const result = func.toString().match(/constructor\(\)|function\s.*?\(([^)]*)\)/)
  if (result && result[1])
    return result[1].replace(/ /g, '').split(',')

  return []
}
