/**
 * This method is project specific.
 *
 * TODO: Let the user configure regexes via the UI
 *
 * @param token
 */
export function replaceToken(token: string): string {
  // use regex to remove all beginning 'min.' from the token
  return token
    .replace(/min\./, '')
    .replace(/max\./, '')
}
