import { Properties } from './properties'

export type DesignTokens = Record<string, string>

/**
 * This function retrieves the applied design tokens from a given node.
 * It first gets all the keys from the Properties object.
 * Then, it maps over these keys and retrieves the shared plugin data from the node for each key.
 * If the value exists, it is added to the array.
 * Finally, it removes the first and last character from the value and returns an object with the key-value pairs.
 *
 * @param node - The node from which to retrieve the applied design tokens.
 * @returns An object containing the applied design tokens.
 */
export function getAppliedTokens(node: SceneNode): DesignTokens {
  const tokenKeys = Object.keys(Properties)

  return Object.fromEntries(
    tokenKeys
      .map((key) => {
        const value = node
          .getSharedPluginData('tokens', key)

        return [key, value]
      })
      .filter(([, value]) => !!value)
      .map(([key, value]) => ([key, value.slice(1, -1)])),
  )
}
