/**
 * Converts a string to camelCase.
 *
 * @param str The string to convert
 * @returns The camelCased string
 */
export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^./, m => m.toLowerCase());
}
