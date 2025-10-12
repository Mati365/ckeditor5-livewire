import { camelCase } from './camel-case';
import { isPlainObject } from './is-plain-object';

/**
 * Recursively converts all keys of a plain object or array to camelCase.
 * Skips class instances and leaves them untouched.
 *
 * @param input The object or array to process
 */
export function deepCamelCaseKeys<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map(deepCamelCaseKeys) as unknown as T;
  }

  if (isPlainObject(input)) {
    const result: Record<string, unknown> = Object.create(null);

    for (const [key, value] of Object.entries(input)) {
      result[camelCase(key)] = deepCamelCaseKeys(value);
    }

    return result as T;
  }

  return input;
}
