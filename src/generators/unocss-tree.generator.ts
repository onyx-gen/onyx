import type { UnoTreeNode } from '../interfaces'
import { UnocssBuilder } from '../builder/unocss-builder'

/**
 * Generates a tree structure representing the UnoCSS components.
 * @param {SceneNode} node - The Figma node to process.
 * @returns {UnoTreeNode|null} The generated tree node, or null if not applicable.
 */
export function generateUnoTree(node: SceneNode): UnoTreeNode | null {
  const isInstance = node.type === 'INSTANCE'

  if (isInstance) {
    const isIcon = isInstance && node.name === 'icon'
    if (isIcon) {
      const mainComponent = node.mainComponent
      if (mainComponent) {
        const iconName = mainComponent.name
        return { children: [], data: { type: 'icon', name: iconName } }
      }
    }
    else {
      return { children: [], data: { type: 'instance', name: node.name } }
    }

    // TODO MF: Add main component name
  }
  else {
    const builder = new UnocssBuilder(node)
    const css = builder.build()

    const hasChildren = 'children' in node && node.children.length > 0

    // If it's a leaf node with empty CSS, return null
    if (!hasChildren && css === '') {
      console.log('Skipping leaf with empty CSS')
      return null
    }

    const unoTreeNode: UnoTreeNode = { data: { type: 'container', css }, children: [] }

    if (hasChildren) {
      node.children
        .filter(child => child.visible)
        .forEach((child) => {
          const childTree = generateUnoTree(child)

          // Only add the child if it's not null
          if (childTree)
            unoTreeNode.children.push(childTree)
        })
    }

    return unoTreeNode
  }

  console.error('This should never happen')
  return null
}
