import { Properties } from './properties'

export type DesignTokensObject = {
  [key in Properties]?: string
}

export type DesignTokens = Map<Properties, string>

// TODO MF: Caching of the applied tokens

/**
 * Retrieves the applied design tokens from a given node.
 * It iterates over each property in Properties, retrieves the corresponding shared plugin data from the node,
 * and then constructs a map of these key-value pairs after slicing off the first and last character of each value.
 * @param node - The node from which to retrieve the applied design tokens.
 * @returns A Map containing the applied design tokens.
 */
export function getAppliedTokens(node: SceneNode): DesignTokens {
  const tokenMap: DesignTokensObject = Object.fromEntries(
    Object.entries(Properties)
      .map(([key]) => {
        const value = node.getSharedPluginData('tokens', key)
        return value ? [key, value.slice(1, -1)] : undefined
      })
      .filter(entry => entry !== undefined) as [Properties, string][],
  )

  return new Map(Object.entries(tokenMap) as [Properties, string][])
}
