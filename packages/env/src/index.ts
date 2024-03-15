import process from 'node:process'
import { dirname, resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import type { Plugin } from 'rollup'
import 'dotenv/config'

export default function envRollupPlugin(): Plugin {
  const prefix = 'CODE_'

  const envVariables = Object.keys(process.env)
    .filter(key => key.startsWith(prefix))
    .reduce((acc, key) => {
      const value = process.env[key]
      if (value)
        acc[key] = value
      return acc
    }, {} as Record<string, string>)

  const typeDefinitions = Object.keys(envVariables).map((key) => {
    // Detect if the value is a number and adjust the type accordingly
    const isNumber = !isNaN(Number(envVariables[key]))
    return `${key}: ${isNumber ? 'number' : 'string'};`
  }).join('\n    ')

  const typeDefinitionTemplate = `
declare module 'virtual:env' {
  const value: {
    ${typeDefinitions}
  };
  
  export default value; 
}
  `.trimStart()

  const outputPath = resolve('.build', 'env.d.ts')

  // Ensure the directory exists
  mkdirSync(dirname(outputPath), { recursive: true })

  // Write the .d.ts file
  writeFileSync(outputPath, typeDefinitionTemplate, 'utf8')

  return {
    name: 'env-rollup-plugin',
    resolveId(source) {
      if (source === 'virtual:env')
        return source

      return null
    },
    load(id) {
      if (id === 'virtual:env') {
        // Convert number strings to actual numbers for the output
        const modifiedEnvVariables = Object.fromEntries(
          Object.entries(envVariables).map(([key, value]) => [key, !isNaN(Number(value)) ? Number(value) : value]),
        )

        return `export default ${JSON.stringify(modifiedEnvVariables)};`
      }

      return null
    },
  }
}
