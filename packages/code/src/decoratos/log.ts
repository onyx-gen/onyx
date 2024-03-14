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
        if (typeof this[methodName] === 'function') {
          const originalMethod = this[methodName] as Function
          this[methodName] = (...methodArgs: any[]) => {
            consola.withDefaults({ level: 5 }).withTag(className).debug(methodName, methodArgs)
            return originalMethod.apply(this, methodArgs)
          }
        }
      })
    }
  }
}
