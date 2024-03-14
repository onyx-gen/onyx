import { consola } from 'consola'

type Constructor<T = any> = new (...args: any[]) => T

/**
 * Attempts to apply logging to a class or a method.
 * If applied to a class, wraps each method to log invocations.
 * If applied to a method, wraps the single method to log its invocation.
 */
export function Log(...args: any[]): any {
  // Determine if the decorator is used as a class or method decorator
  if (args.length === 1 && typeof args[0] === 'function') {
    // Class decorator
    return applyClassDecorator(args[0])
  }
  else if (args.length === 3) {
    // Method decorator
    return applyMethodDecorator(...args as unknown as [object, string | symbol, PropertyDescriptor])
  }
  else {
    throw new Error('Invalid decorator usage')
  }
}

function applyClassDecorator<T extends Constructor>(constructor: T): T {
  // Get the prototype of the class
  const prototype = constructor.prototype

  // Iterate over all properties of the prototype
  Object.getOwnPropertyNames(prototype).forEach((methodName) => {
    // Skip the constructor
    if (methodName === 'constructor')
      return

    const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName)
    if (descriptor && typeof descriptor.value === 'function') {
      // Wrap the method with logging functionality
      Object.defineProperty(prototype, methodName, {
        value(...args: any[]) {
          const paramNames = getParamNames(descriptor.value)
          logMethodInvocation(constructor.name, methodName, paramNames, args)
          return descriptor.value.apply(this, args)
        },
        writable: descriptor.writable,
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
      })
    }
  })

  // Return the modified constructor
  return constructor
}

function applyMethodDecorator(target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void | PropertyDescriptor {
  const originalMethod = descriptor.value
  const className = target.constructor.name
  const methodName = propertyKey.toString()
  const paramNames = getParamNames(originalMethod)

  descriptor.value = function (...methodArgs: any[]) {
    logMethodInvocation(className, methodName, paramNames, methodArgs)
    return originalMethod.apply(this, methodArgs)
  }
}

function getParamNames(func: Function): string[] {
  const result = func.toString().match(/function\s.*?\(([^)]*)\)/) || func.toString().match(/(?:\(.*?\))\s*=>/)
  if (result && result[1])
    return result[1].replace(/ /g, '').split(',')

  return []
}

function logMethodInvocation(className: string, methodName: string, paramNames: string[], methodArgs: any[]) {
  const argsWithNames = paramNames.reduce((obj, name, index) => {
    obj[name] = methodArgs[index]
    return obj
  }, {} as Record<string, any>)

  consola.withDefaults({ level: 5 }).withTag(`${className}.${methodName}`).debug(argsWithNames)
}
