import type { ContainerNodeData, IconNodeData, InstanceNodeData } from '../../interfaces'
import { calculateVariantCSSDifference, calculateVariantCSSUnion, wrapInVariant } from '../../css'
import AbstractDataMerger from '../data-merger'

/**
 * Class responsible for merging TreeNodeData of different types.
 */
class StateDataMerger extends AbstractDataMerger {
  constructor(
    // e.g. 'default', 'hover', 'focus' or 'active'
    private readonly state: string,
  ) {
    super()
  }

  protected mergeContainerData(data1: ContainerNodeData, data2: ContainerNodeData): ContainerNodeData {
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

  protected mergeInstanceData(data1: InstanceNodeData, data2: InstanceNodeData): InstanceNodeData {
    // TODO MF
    console.error('[StateDataMerger] mergeInstanceData method not yet implemented.', { data1, data2 })
    return data1
  }

  protected mergeIconData(data1: IconNodeData, data2: IconNodeData): IconNodeData {
    // TODO MF
    console.error('[StateDataMerger] mergeIconData method not yet implemented.', { data1, data2 })
    return data1
  }
}

export default StateDataMerger
