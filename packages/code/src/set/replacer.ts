/**
 * This method is project specific.
 *
 * TODO: Let the user configure regexes via the UI
 *
 * @param prop
 */
export function replaceComponentPropValue(prop: string): string {
  return prop
    .replace(/\s*\(default\)/, '')
    .replace(/^> s$/, 'md')
}

/**
 * Removes non-alphanumeric characters from a string.
 *
 * @param {string} inputStr - The input string to remove non-alphanumeric characters from.
 * @return {string} The input string with non-alphanumeric characters removed.
 */
export function removeNonAlphanumericChars(inputStr: string): string {
  return inputStr.replace(/[^a-zA-Z0-9]/g, '')
}
