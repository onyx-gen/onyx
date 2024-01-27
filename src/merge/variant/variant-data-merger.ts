import type { TreeNodeData } from '../../interfaces'
import type { IDataMerger } from '../types'

class VariantDataMerger implements IDataMerger {
  constructor(private readonly variant: string) {}

  public merge(data1: TreeNodeData, data2: TreeNodeData): TreeNodeData {
    console.log('variant merge data', { data1, data2, variant: this.variant })
    return data1
  }
}

export default VariantDataMerger
