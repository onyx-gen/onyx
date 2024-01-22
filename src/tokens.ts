import { Properties } from './properties'

export function getAppliedTokens(node: SceneNode) {
  const tokenKeys = Object.keys(Properties)

  return tokenKeys
    .map((key) => {
      const value = node.getSharedPluginData('tokens', key)

      return value && `${key}: ${value};`
    })
    .filter(x => x)
    .join('\n')
}
