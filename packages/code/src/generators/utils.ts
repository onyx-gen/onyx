/**
 * Simplifies a conditional string by handling parts that end with "-true" or "-false".
 *
 * - If a part ends with "-true", it removes the "-true" suffix.
 * - If a part ends with "-false", the "-false" suffix is removed and a "!" is prefixed to the condition.
 *   Multiple '!' or other non-alphabetic prefixes are handled appropriately.
 *
 * @param {string} conditionalStr - The conditional string to be simplified.
 * @returns {string} - The simplified conditional string.
 */
export function simplifyConditionalString(conditionalStr: string): string {
  // Split the string by spaces to process each part separately
  const parts = conditionalStr.split(' ')

  // Use map to transform each part based on the "-true" or "-false" suffix
  const simplifiedParts = parts.map((part) => {
    // Check if the part ends with "-true"
    if (part.endsWith('-true')) {
      // Remove the "-true" suffix
      return part.slice(0, -5)
    }
    else if (part.endsWith('-false')) {
      // Find the index where the condition name starts (first alphabetical character)
      const conditionStartIndex = part.search(/[a-zA-Z]/)
      // Extract the prefix (which may contain '!' and other non-alphabetic characters)
      const prefix = part.substring(0, conditionStartIndex)
      // Remove the "-false" suffix and store the base condition name
      const baseCondition = part.substring(conditionStartIndex, part.length - 6)
      // Construct the new condition part by adding "!" to the existing prefix and appending the base condition name
      return `!${prefix}${baseCondition}`.replaceAll('!!', '')
    }
    else {
      // If the part does not end with "-true" or "-false", return it unchanged
      return part
    }
  })

  // Filter out any empty strings and join the parts back together with spaces
  return simplifiedParts.filter(part => part !== '').join(' ')
}

/**
 * Transforms the given property key by removing any characters that are not alphabetical, "-" or "_".
 *
 * @param {string} propKey - The property key to transform.
 * @returns {string} The transformed property key.
 */
export function transformPropKey(propKey: string): string {
  // Regex to match only alphabetical characters, "-" and "_"
  const allowedCharsRegex: RegExp = /^[A-Za-z-_]+$/

  // Split the propKey into characters, filter based on the regex, and join back into a string
  return propKey.split('').filter(char => allowedCharsRegex.test(char)).join('')
}

/**
 * Converts a string to PascalCase.
 *
 * @param {string} string - The string to convert.
 * @returns {string} The converted string in PascalCase.
 */
export function toPascalCase(string: string): string {
  return string
    .split(/[-_ ]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

/**
 * This method is used to generate a string that represents the HTML tag for an instance node.
 * @param treeNode - The TreeNode of type InstanceNodeData for which the HTML tag string is to be generated.
 * @returns A string representing the HTML tag for the given instance node.
 */
export function getInstanceNodeHTMLTag(nodeName: string): string {
  return toPascalCase(nodeName
    .replaceAll('\\', '_')
    .replaceAll('/', '_')
    .replaceAll(' ', '_')
    .replaceAll(/^_+/g, '')) // Remove leading underscores
}
