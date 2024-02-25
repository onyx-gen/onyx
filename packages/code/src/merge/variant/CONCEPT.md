

Variants = (Variant1, Variant2, Variant3, CurrentVariant)

Current ContainerNodeCSSData:
```json
{
  "default": ...,
  "variant1": ...,
  "variant2": ...,
  "variant3": ...,
}
```


### Aim

Add 'currentVariant' to ContainerNodeCSSData

### Pseudo Implementation

Steps:
- `mergeCSSData(variant1, currentVariant) = (intersection1, onlyVariant1, onlyCurrentVariant1)`
- `mergeCSSData(variant2, currentVariant) = (intersection2, onlyVariant2, onlyCurrentVariant2)`
- `mergeCSSData(variant3, currentVariant) = (intersection3, onlyVariant3, onlyCurrentVariant3)`

- `mergeCSSData(default, currentVariant) = (intersectionDefault, onlyDefault, onlyCurrentVariantDefault)`

Pseudo Code for variables:
```
const onlyCurrentUnion = onlyCurrentVariant1 ∪ onlyCurrentVariant2 ∪ onlyCurrentVariant3
const intersectionAll = intersection1 ∩ intersection2 ∩ intersection3

const intersection1Reduced = intersection1 - intersectionAll
const intersection2Reduced = intersection2 - intersectionAll
const intersection3Reduced = intersection3 - intersectionAll

const intersectionsReduced = [intersection1Reduced, intersection2Reduced, intersection3Reduced]
const intersectionReducedUnion = intersection1Reduced ∪ intersection2Reduced ∪ intersection3Reduced
const defaultVariantCSS = intersectionAll ∪ intersectionDefault
const currentVariantCSS = (onlyCurrentUnion ∪ intersectionReducedUnion ∪ onlyCurrentVariantDefault) - defaultVariantCSS
const variant1VariantCSS = (onlyVariant1 ∪ intersection1Reduced ∪ onlyDefault) - defaultVariantCSS
const variant2VariantCSS = (onlyVariant2 ∪ intersection2Reduced ∪ onlyDefault) - defaultVariantCSS
const variant3VariantCSS = (onlyVariant3 ∪ intersection3Reduced ∪ onlyDefault) - defaultVariantCSS
const variantsCSS = [variant1VariantCSS, variant2VariantCSS, variant3VariantCSS]
```

Output ContainerNodeCSSData:
```json
{
  "default": defaultVariantCSS,
  "currentVariant": currentVariantCSS,
  "variant1": variant1VariantCSS,
  "variant2": variant2VariantCSS,
  "variant3": variant3VariantCSS,
}
```


