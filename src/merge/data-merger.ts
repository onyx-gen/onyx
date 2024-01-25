import type { ContainerNodeData, IconNodeData, InstanceNodeData, TextNodeData, TreeNodeData } from '../interfaces'
import { difference } from '../set/utils'

/**
 * Class responsible for merging TreeNodeData of different types.
 */
class DataMerger {
  constructor(private readonly state: string) {}

  /**
   * Merges the data of two TreeNodeData objects.
   *
   * @param data1 The first TreeNodeData to merge.
   * @param data2 The second TreeNodeData to merge.
   * @returns TreeNodeData representing the merged result of data1 and data2.
   */
  public merge(data1: TreeNodeData, data2: TreeNodeData): TreeNodeData {
    // Merge based on the type of TreeNodeData
    switch (data1.type) {
      case 'container':
        return this.mergeContainerData(data1, data2 as ContainerNodeData)
      case 'text':
        return this.mergeTextData(data1, data2 as TextNodeData)
      case 'instance':
        return this.mergeInstanceData(data1, data2 as InstanceNodeData)
      case 'icon':
        return this.mergeIconData(data1, data2 as IconNodeData)
      default:
        throw new Error('Unsupported data type')
    }
  }

  /**
   * Merges ContainerNodeData objects.
   *
   * @param data1 The first ContainerNodeData to merge.
   * @param data2 The second ContainerNodeData to merge.
   * @returns ContainerNodeData representing the merged result.
   */
  private mergeContainerData(data1: ContainerNodeData, data2: ContainerNodeData): ContainerNodeData {
    if (data1.css !== data2.css) {
      const cssDiff = difference(data2.css, data1.css)

      // No difference so return data1
      if (cssDiff.size === 0)
        return data1

      const variantCss = this.composeVariantCss(this.state, cssDiff)

      return {
        type: 'container',
        css: new Set([...data1.css, variantCss]),
      }
    }
    else {
      return data1
    }
  }

  /**
   * Merges TextNodeData objects.
   *
   * @param data1 The first TextNodeData to merge.
   * @param data2 The second TextNodeData to merge.
   * @returns TextNodeData representing the merged result.
   */
  private mergeTextData(data1: TextNodeData, data2: TextNodeData): TextNodeData {
    if (data1.text !== data2.text) {
      // Example: Concatenate text
      return {
        type: 'text',
        text: `text1(${data1.text}) text2(${data2.text})`,
      }
    }
    else {
      return data1
    }
  }

  /**
   * Merges InstanceNodeData objects.
   *
   * @param data1 The first InstanceNodeData to merge.
   * @param data2 The second InstanceNodeData to merge.
   * @returns InstanceNodeData representing the merged result.
   */
  private mergeInstanceData(data1: InstanceNodeData, data2: InstanceNodeData): InstanceNodeData {
    // TODO: Implement instance data merging logic
    console.error('Merging Instance Data (NOT YET IMPLEMENTED)', data1, data2)
    return data1
  }

  /**
   * Merges IconNodeData objects.
   *
   * @param data1 The first IconNodeData to merge.
   * @param data2 The second IconNodeData to merge.
   * @returns IconNodeData representing the merged result.
   */
  private mergeIconData(data1: IconNodeData, data2: IconNodeData): IconNodeData {
    // TODO: Implement icon data merging logic
    console.log('Merging Icon Data (NOT YET IMPLEMENTED)', data1, data2)
    return data1
  }

  /**
   * Composes a CSS string for a specific variant by combining CSS classes.
   *
   * @param variantName - The name of the variant (e.g., 'hover', 'focus').
   * @param cssClasses - A set of CSS class names to be combined for the variant.
   * @returns {string} - The CSS string for the specified variant. If multiple classes are present,
   *                      they are wrapped in parentheses. Returns an empty string if no classes are provided.
   */
  private composeVariantCss(variantName: string, cssClasses: Set<string>): string {
    if (cssClasses.size === 0)
      return ''

    const allClasses = [...cssClasses.values()]
    const requiresParentheses = cssClasses.size > 1 || allClasses[0].includes(' ')

    return `${variantName}:${requiresParentheses ? '(' : ''}${allClasses.join(' ')}${requiresParentheses ? ')' : ''}`
  }
}

export default DataMerger
