import type { ContainerNodeData, IconNodeData, InstanceNodeData } from '../../interfaces'
import AbstractDataMerger from '../data-merger'

class VariantDataMerger extends AbstractDataMerger {
  constructor(
    // For example: `variant-primary`, `variant-secondary` or `selected-true`, `selected-false`
    private readonly variant: string,
  ) {
    super()
  }

  protected mergeContainerData(data1: ContainerNodeData, data2: ContainerNodeData): ContainerNodeData {
    console.error('[VariantDataMerger] mergeContainerData method not yet implemented.', { data1, data2 })
    return data1
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
