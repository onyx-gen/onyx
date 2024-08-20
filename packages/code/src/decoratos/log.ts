import { consola } from 'consola'

type Constructor<T = any> = new (...args: any[]) => T

// Global variable to track the current nesting level of method invocations
let currentLevel = 0

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
      const originalMethod = prototype[methodName]

      prototype[methodName] = function (...args: any[]) {
        const paramNames = getParamNames(originalMethod)
        logMethodStart(constructor.name, methodName, paramNames, args, ++currentLevel)

        try {
          const result = originalMethod.apply(this, args)
          if (result instanceof Promise) {
            return result.then((resolvedResult) => {
              logMethodEnd(constructor.name, methodName, resolvedResult, currentLevel--)
              return resolvedResult
            }).catch((error) => {
              console.error(`${constructor.name}.${methodName} resulted in error:`, error)
              --currentLevel
              throw error
            })
          }
          else {
            logMethodEnd(constructor.name, methodName, result, currentLevel--)
            return result
          }
        }
        catch (error) {
          console.error(`${constructor.name}.${methodName} resulted in error:`, error)
          --currentLevel
          throw error
        }
      }
    }
  })

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

  descriptor.value = function (...methodArgs: any[]) {
    // Adjusted to log before method execution
    const paramNames = getParamNames(originalMethod)
    logMethodStart(target.constructor.name, propertyKey.toString(), paramNames, methodArgs, ++currentLevel)

    try {
      const result = originalMethod.apply(this, methodArgs)
      if (result instanceof Promise) {
        return result.then((resolvedResult) => {
          logMethodEnd(target.constructor.name, propertyKey.toString(), resolvedResult, currentLevel--)
          return resolvedResult
        }).catch((error) => {
          console.error(`${target.constructor.name}.${propertyKey.toString()} resulted in error:`, error)
          --currentLevel
          throw error
        })
      }
      else {
        logMethodEnd(target.constructor.name, propertyKey.toString(), result, currentLevel--)
        return result
      }
    }
    catch (error) {
      console.error(`${target.constructor.name}.${propertyKey.toString()} resulted in error:`, error)
      --currentLevel
      throw error
    }
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

/**
 * Logs the start of a method invocation, including method parameters and their values.
 * @param className - The name of the class containing the method.
 * @param methodName - The name of the invoked method.
 * @param paramNames - An array containing the names of the parameters of the method.
 * @param methodArgs - The arguments passed to the method at invocation.
 * @param level - The current nesting level of method invocations, used for hierarchical logging.
 */
function logMethodStart(className: string, methodName: string, paramNames: string[], methodArgs: any[], level: number) {
  const argsWithNames = paramNames.reduce((obj, name, index) => {
    obj[name] = methodArgs[index]
    return obj
  }, {} as Record<string, any>)

  logInvocation('start', className, methodName, argsWithNames, undefined, level)
}

/**
 * Logs the end of a method invocation, including the result of the method call.
 * @param className - The name of the class containing the method.
 * @param methodName - The name of the method whose invocation has ended.
 * @param result - The result returned by the method invocation.
 * @param level - The current nesting level of method invocations, decremented after logging.
 */
function logMethodEnd(className: string, methodName: string, result: any, level: number) {
  logInvocation('end', className, methodName, {}, result, level)
}

/**
 * Generic logging function for both start and end of method invocations.
 * @param type - Indicates whether the invocation is starting or ending ('start' | 'end').
 * @param className - The name of the class containing the method.
 * @param methodName - The name of the method being invoked.
 * @param argsWithNames - An object mapping parameter names to their values. Empty for method end.
 * @param result - The result of the method invocation. Defined for method end.
 * @param level - The nesting level of the method invocation.
 */
function logInvocation(type: 'start' | 'end', className: string, methodName: string, argsWithNames: Record<string, any>, result: any, level: number) {
  const tag = {
    className,
    methodName,
    level,
    type,
  }

  const message: any = {
    parameters: argsWithNames,
  }

  if (result) {
    if (result instanceof Set || result instanceof Map)
      message.result = Array.from(result)
    else
      message.result = result
  }

  consola
    .withDefaults({
      level: 5,
      tag: JSON.stringify(tag),
    })
    .debug(message)
}
