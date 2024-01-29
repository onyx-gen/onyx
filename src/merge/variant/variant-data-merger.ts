import type { ContainerNodeCSSData, ContainerNodeData, IconNodeData, InstanceNodeData } from '../../interfaces'
import AbstractDataMerger from '../data-merger'
import type { VariantKey, VariantPermutation } from '../../set/types'
import { variantKey } from '../utils'

class VariantDataMerger extends AbstractDataMerger {
  constructor(private readonly variantPermutation: VariantPermutation) {
    console.log('Constructed VariantDataMerger', { variantPermutation })
    super()
  }

  private get variant(): VariantKey {
    return variantKey(this.variantPermutation)
  }

  protected mergeContainerData(data1: ContainerNodeData, data2: ContainerNodeData): ContainerNodeData {
    const cssData: ContainerNodeCSSData = {
      ...data1.css,
      ...data2.css,
    }

    // TODO MF: Do optimization here to remove duplicate CSS rules

    return { type: 'container', css: cssData }
  }

  protected mergeInstanceData(data1: InstanceNodeData, data2: InstanceNodeData): InstanceNodeData {
    console.error('[VariantDataMerger] mergeInstanceData method not yet implemented.', { data1, data2 })
    return data1
  }

  protected mergeIconData(data1: IconNodeData, data2: IconNodeData): IconNodeData {
    console.error('[VariantDataMerger] mergeIconData method not yet implemented.', { data1, data2 })
    return data1
  }
}

export default VariantDataMerger
