import type { ContainerNodeCSSData, ContainerNodeData, IconNodeData, InstanceNodeData } from '../../interfaces'
import AbstractDataMerger from '../data-merger'
import type { VariantKey, VariantPermutation } from '../../set/types'
import { variantKey } from '../utils'
import { calculateVariantCSSDifference, calculateVariantCSSUnion } from '../../css'

class VariantDataMerger extends AbstractDataMerger {
  constructor(private readonly variantPermutation: VariantPermutation) {
    console.log('Constructed VariantDataMerger', { variantPermutation })
    super()
  }

  private get variant(): VariantKey {
    return variantKey(this.variantPermutation)
  }

  protected mergeContainerData(
    data1: ContainerNodeData,
    data2: ContainerNodeData,
  ): ContainerNodeData {
    data1.css = data1.css || {}
    data2.css = data2.css || {}

    const firstKey = this.getFirstKey(data1.css)
    if (!firstKey) {
      console.error('firstKey not found', { keysData1: Object.keys(data1.css) })
      return data1
    }

    const cssData1Variant = data1.css[firstKey]
    const cssData2Variant = data2.css[this.variant]

    if (!cssData1Variant || !cssData2Variant) {
      console.error('cssData1Variant or cssData2Variant empty', {
        cssData1Variant,
        cssData2Variant,
      })
      return data1
    }

    const mergedCSSData = this.mergeCSSData(
      cssData1Variant,
      cssData2Variant,
      data1.css.default,
      firstKey,
    )

    return { type: 'container', css: mergedCSSData }
  }

  private getFirstKey(cssData: ContainerNodeCSSData): string | null {
    const keys = Object.keys(cssData)
    return keys.find(key => key !== 'default' && key !== this.variant) || null
  }

  private mergeCSSData(
    cssData1Variant: any,
    cssData2Variant: any,
    defaultCSS: any,
    firstKey: string,
  ): ContainerNodeCSSData {
    const differenceData1Data2 = calculateVariantCSSDifference(
      cssData1Variant,
      cssData2Variant,
    )
    const differenceData2Data1 = calculateVariantCSSDifference(
      cssData2Variant,
      cssData1Variant,
    )
    const unionData1Data2 = calculateVariantCSSUnion(
      cssData1Variant,
      cssData2Variant,
    )
    const intersectionData1Data2 = calculateVariantCSSDifference(
      calculateVariantCSSDifference(unionData1Data2, differenceData1Data2),
      differenceData2Data1,
    )

    return {
      default: calculateVariantCSSUnion(defaultCSS, intersectionData1Data2),
      [firstKey]: differenceData1Data2,
      [this.variant]: differenceData2Data1,
    }
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
