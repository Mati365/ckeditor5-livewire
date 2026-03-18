/**
 * Checks if the given element is connected to a wire:model directive in its ancestry.
 *
 * @param element - The HTML element to check for wire:model connection.
 * @returns True if the element is connected to a wire:model directive, false otherwise.
 */
export function isWireModelConnected(element: HTMLElement): boolean {
  let parent: HTMLElement | null = element;

  while (parent) {
    for (const attr of parent.attributes) {
      if (attr.name.startsWith('wire:model')) {
        return true;
      }
    }
    parent = parent.parentElement;
  }

  return false;
}
