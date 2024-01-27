import type { ContainerNodeData, IconNodeData, InstanceNodeData, TextNodeData, TreeNodeData } from '../../interfaces'
import { calculateVariantCSSDifference, calculateVariantCSSUnion, wrapInVariant } from '../../css'
import type { IDataMerger } from '../types'

/**
 * Class responsible for merging TreeNodeData of different types.
 */
class StateDataMerger implements IDataMerger {
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
    const calculateVariantCSSDifference1 = calculateVariantCSSDifference(data2.css, data1.css)
    const hasDifferences = calculateVariantCSSDifference1.css.length > 0

    if (hasDifferences) {
      const variantCSSIfState = wrapInVariant(this.state, calculateVariantCSSDifference1)
      const newVariantCSS = calculateVariantCSSUnion(data1.css, variantCSSIfState)

      return {
        type: 'container',
        css: newVariantCSS,
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
    // TODO MF
    console.error('mergeInstanceData method not yet implemented.', { data1, data2 })
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
    // TODO MF
    console.error('mergeIconData method not yet implemented.', { data1, data2 })
    return data1
  }
}

export default StateDataMerger
