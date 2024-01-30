import { cloneDeep } from 'lodash-es'
import type {
  ContainerNodeCSSData,
  ContainerNodeData,
  IconNodeData,
  InstanceNodeData,
  VariantCSS,
} from '../../interfaces'
import AbstractDataMerger from '../data-merger'
import type { VariantKey, VariantPermutation } from '../../set/types'
import { variantKey } from '../utils'
import { calculateVariantCSSDifference, calculateVariantCSSIntersection, calculateVariantCSSUnion } from '../../css'

const VARIANT_KEY_DEFAULT = 'default'

type MergedCSSVariants = [VariantCSS, VariantCSS, VariantCSS]

class VariantDataMerger extends AbstractDataMerger {
  constructor(private readonly variantPermutation: VariantPermutation) {
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

    const otherKeys = this.getOtherVariantKeys(data1.css)
    if (otherKeys.length === 0) {
      return {
        type: 'container',
        css: {
          [VARIANT_KEY_DEFAULT]: data1.css[this.variant],
          [this.variant]: { css: [] },
        },
      }
    }

    const mergedNonDefaults = this.getMergedNonDefaultCSSData(data1, data2)

    const [intersectionDefault, onlyDefault, onlyCurrentVariantDefault] = this.getMergedDefaultCSSData(data1, data2)

    const onlyCurrentUnion: VariantCSS = mergedNonDefaults.reduce(
      (acc, curr) => {
        const [,, onlyCurrentVariant] = curr
        return calculateVariantCSSUnion(acc, onlyCurrentVariant)
      },
      { css: [] } as VariantCSS,
    )

    const intersectionAll: VariantCSS = mergedNonDefaults.reduce(
      (acc, curr) => {
        const [intersection] = curr
        return calculateVariantCSSIntersection(acc, intersection)
      },
      { css: [] } as VariantCSS,
    )

    const intersectionsReduced = mergedNonDefaults.map((mergedNonDefault) => {
      const [intersection] = mergedNonDefault
      return calculateVariantCSSDifference(intersection, intersectionAll)
    })

    const intersectionReducedUnion: VariantCSS = intersectionsReduced.reduce(
      (acc, curr) => calculateVariantCSSUnion(acc, curr),
      { css: [] } as VariantCSS,
    )

    const defaultVariantCSS = calculateVariantCSSUnion(
      intersectionAll,
      intersectionDefault,
    )

    // (onlyCurrentUnion ∪ intersectionReducedUnion ∪ onlyCurrentVariantDefault) - defaultVariantCSS
    const currentVariantCSS = calculateVariantCSSDifference(
      calculateVariantCSSUnion(
        calculateVariantCSSUnion(
          onlyCurrentUnion,
          intersectionReducedUnion,
        ),
        onlyCurrentVariantDefault,
      ),
      defaultVariantCSS,
    )

    const variantsCSS = mergedNonDefaults.map((mergedNonDefault, index) => {
      const [, onlyVariant] = mergedNonDefault
      const union = calculateVariantCSSUnion(
        calculateVariantCSSUnion(onlyVariant, intersectionsReduced[index]),
        onlyDefault,
      )

      return calculateVariantCSSDifference(union, defaultVariantCSS)
    })

    const containerNodeCSSData: ContainerNodeCSSData = {
      [VARIANT_KEY_DEFAULT]: defaultVariantCSS,
    }

    this.getOtherVariantKeys(data1.css).forEach((otherVariantKey, index) => {
      if (variantsCSS[index].css.length !== 0)
        containerNodeCSSData[otherVariantKey] = variantsCSS[index]
    })

    if (currentVariantCSS.css.length !== 0)
      containerNodeCSSData[this.variant] = currentVariantCSS

    return { type: 'container', css: containerNodeCSSData }
  }

  private getMergedDefaultCSSData(data1: ContainerNodeData, data2: ContainerNodeData) {
    const cssData1Variant: VariantCSS = data1.css?.[VARIANT_KEY_DEFAULT] || { css: [] }
    const cssData2Variant: VariantCSS | undefined = data2.css?.[this.variant]

    if (!cssData2Variant) {
      console.error('[VariantDataMerger] cssData2Variant empty (default)')
      throw new Error('cssData2Variant empty (default)')
    }

    return this.mergeCSSData(cssData1Variant, cssData2Variant)
  }

  private getMergedNonDefaultCSSData(data1: ContainerNodeData, data2: ContainerNodeData): MergedCSSVariants[] {
    const css1 = data1.css ? cloneDeep(data1.css) : {}
    const css2 = data2.css ? cloneDeep(data2.css) : {}

    const otherVariantKeys = this.getOtherVariantKeys(css1)

    return otherVariantKeys.map((otherVariantKey) => {
      const cssData1Variant: VariantCSS | undefined = css1[otherVariantKey]
      const cssData2Variant: VariantCSS | undefined = css2[this.variant]

      if (!cssData1Variant || !cssData2Variant) {
        console.error('[VariantDataMerger] cssData1Variant or cssData2Variant empty')
        throw new Error('cssData1Variant or cssData2Variant empty')
      }

      return this.mergeCSSData(cssData1Variant, cssData2Variant)
    })
  }

  private getOtherVariantKeys(cssData: ContainerNodeCSSData): string[] {
    return Object.keys(cssData).filter(key => key !== 'default' && key !== this.variant)
  }

  private mergeCSSData(
    css1: VariantCSS,
    css2: VariantCSS,
  ): MergedCSSVariants {
    // cssWrapper1 - cssWrapper2
    const differenceData1Data2 = calculateVariantCSSDifference(
      css1,
      css2,
    )

    // cssWrapper2 - cssWrapper1
    const differenceData2Data1 = calculateVariantCSSDifference(
      css2,
      css1,
    )

    // cssWrapper1 + cssWrapper2
    const unionData1Data2 = calculateVariantCSSUnion(
      css1,
      css2,
    )

    // intersection of cssWrapper1 and cssWrapper2
    const intersectionData1Data2 = calculateVariantCSSDifference(
      calculateVariantCSSDifference(unionData1Data2, differenceData1Data2),
      differenceData2Data1,
    )

    return [
      intersectionData1Data2, // css1 ∩ css2
      differenceData1Data2, // only css1
      differenceData2Data1, // only css2
    ]
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
