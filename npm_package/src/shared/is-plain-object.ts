/**
 * Utility to check if a value is a plain object (not an array, not null, not a class instance).
 *
 * @param value The value to check.
 * @returns True if the value is a plain object, false otherwise.
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false;
  }

  const proto = Object.getPrototypeOf(value);

  return proto === Object.prototype || proto === null;
}
