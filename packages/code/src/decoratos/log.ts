import { consola } from 'consola'

type Constructor<T = any> = new (...args: any[]) => T

/**
 * A decorator for logging class or method invocations.
 * @remarks
 * When applied to a class, it wraps each method to log its invocations.
 * When applied to a method, it wraps the specific method to log its invocation.
 *
 * @example
 * // Applying `Log` as a class decorator
 * ＠Log
 * class ExampleClass {
 *   method1(param1: string) {
 *     console.log(param1);
 *   }
 *
 *   method2(param2: number) {
 *     console.log(param2);
 *   }
 * }
 *
 * @example
 * // Applying `Log` directly to a method
 * class AnotherClass {
 *   ＠Log
 *   someMethod(param: string) {
 *     console.log(param);
 *   }
 * }
 *
 * @param args - The arguments passed to the decorator, determining its application context.
 * @returns The decorator applied to a class or method, depending on the provided arguments.
 * @throws {Error} Throws an error if the decorator is used incorrectly.
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

/**
 * Applies the logging decorator to a class.
 * @param constructor - The class constructor to which the logging functionality will be applied.
 * @returns The class constructor with wrapped methods for logging.
 * @template T - The type of the class constructor.
 */
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
          const methodResult = descriptor.value.apply(this, args)
          handleMethodInvocationLogging(constructor.name, methodName, paramNames, args, methodResult)
          return methodResult
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

/**
 * Applies the logging decorator to a single method of a class.
 * @param target - The prototype of the class containing the method.
 * @param propertyKey - The name or symbol of the method to be decorated.
 * @param descriptor - The property descriptor for the method.
 * @returns {void | PropertyDescriptor} A possibly modified property descriptor incorporating logging, or `void`.
 */
function applyMethodDecorator(target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void | PropertyDescriptor {
  const originalMethod = descriptor.value
  const className = target.constructor.name
  const methodName = propertyKey.toString()
  const paramNames = getParamNames(originalMethod)

  descriptor.value = function (...methodArgs: any[]) {
    const methodResult = originalMethod.apply(this, methodArgs)
    handleMethodInvocationLogging(className, methodName, paramNames, methodArgs, methodResult)
    return methodResult
  }
}

/**
 * Extracts parameter names from a function.
 * @param func - The function from which parameter names are to be extracted.
 * @returns An array of parameter names.
 */
function getParamNames(func: Function): string[] {
  const result = func.toString().match(/function\s.*?\(([^)]*)\)/) || func.toString().match(/(?:\(.*?\))\s*=>/)
  if (result && result[1])
    return result[1].replace(/ /g, '').split(',')

  return []
}

function handleMethodInvocationLogging(className: string, methodName: string, paramNames: string[], methodArgs: any[], methodResult: any) {
  if (methodResult instanceof Promise) {
    methodResult.then((resolvedResult) => {
      logMethodInvocation(className, methodName, paramNames, methodArgs, resolvedResult)
    }).catch((error) => {
      // Optionally log errors or handle them as needed
      console.error(`${className}.${methodName} resulted in error:`, error)
    })
  }
  else {
    logMethodInvocation(className, methodName, paramNames, methodArgs, methodResult)
  }
}

/**
 * Logs a method's invocation with its arguments.
 * @param className - The name of the class containing the invoked method.
 * @param methodName - The name of the invoked method.
 * @param paramNames - The names of the parameters of the invoked method.
 * @param methodArgs - The arguments passed to the invoked method.
 * @param result - The result of the invoked method, if any.
 */
function logMethodInvocation(className: string, methodName: string, paramNames: string[], methodArgs: any[], result?: any) {
  const argsWithNames = paramNames.reduce((obj, name, index) => {
    obj[name] = methodArgs[index]
    return obj
  }, {} as Record<string, any>)

  consola.withDefaults({ level: 5 }).withTag(`${className}.${methodName}`).debug('Parameters:', argsWithNames, 'Result:', result)
}
