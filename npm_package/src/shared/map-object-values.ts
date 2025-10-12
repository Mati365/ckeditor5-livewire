/**
 * Maps the values of an object using a provided mapper function.
 *
 * @param obj The object whose values will be mapped.
 * @param mapper A function that takes a value and its key, and returns a new value.
 * @template T The type of the original values in the object.
 * @template U The type of the new values in the object.
 * @returns A new object with the same keys as the original, but with values transformed by
 */
export function mapObjectValues<T, U>(
  obj: Record<string, T>,
  mapper: (value: T, key: string) => U,
): Record<string, U> {
  const mappedEntries = Object
    .entries(obj)
    .map(([key, value]) => [key, mapper(value, key)] as const);

  return Object.fromEntries(mappedEntries);
}
