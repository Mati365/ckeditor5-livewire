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
