import { vi } from 'vitest'
import type { Properties } from '../../src/tokens/properties'

function createTokenHandler(tokens: Map<Properties, string>) {
  return (namespace: string, key: string) => {
    if (namespace === 'tokens') {
      const hasToken = tokens.has(key as Properties)

      if (hasToken)
        return ` ${tokens.get(key as Properties) ?? ''} `
    }

    return ''
  }
}

export function setTokens(node: SceneNode, tokens: Map<Properties, string>) {
  const spy = vi.spyOn(node, 'getSharedPluginData')
  spy.mockImplementation(createTokenHandler(tokens))
}
