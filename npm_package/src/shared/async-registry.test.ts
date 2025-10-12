import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Destructible } from './async-registry';

import { AsyncRegistry } from './async-registry';

describe('async registry', () => {
  let registry: AsyncRegistry<Mockitem>;

  beforeEach(() => {
    registry = new AsyncRegistry<Mockitem>();
  });

  afterEach(async () => {
    await registry.destroyAll();
  });

  describe('register', () => {
    it('should register an item with a given ID', () => {
      const item = createMockItem('item1');

      registry.register('item1', item);

      expect(registry.getItems()).toContain(item);
    });

    it('should register the first item as the default (null ID) item', async () => {
      const item1 = createMockItem('item1');

      registry.register('item1', item1);

      const promise = registry.execute(null, item => item);

      await expect(promise).resolves.toBe(item1);
    });

    it('should not override the default item if one is already set', async () => {
      const item1 = createMockItem('item1');
      const item2 = createMockItem('item2');

      registry.register('item1', item1);
      registry.register('item2', item2);

      const defaultitem = await registry.execute(null, item => item);

      expect(defaultitem).toBe(item1);
      expect(defaultitem).not.toBe(item2);
    });

    it('should throw an error if an item with the same ID is already registered', () => {
      const item = createMockItem('item1');

      registry.register('item1', item);
      expect(() => registry.register('item1', item)).toThrow(
        'Item with ID "item1" is already registered.',
      );
    });
  });

  describe('unregister', () => {
    it('should unregister an item', () => {
      const item = createMockItem('item1');

      registry.register('item1', item);
      registry.unregister('item1');
      expect(registry.getItems()).not.toContain(item);
    });

    it('should throw an error if trying to unregister an item that is not registered', () => {
      expect(() => registry.unregister('nonexistent')).toThrow(
        'Item with ID "nonexistent" is not registered.',
      );
    });

    it('should also unregister the default item if the unregistered item was the default one', async () => {
      const item1 = createMockItem('item1');

      registry.register('item1', item1); // This also registers it as default

      // Check it is the default
      const promise = registry.execute(null, item => item);

      await expect(promise).resolves.toBe(item1);

      registry.unregister('item1');

      // Now check that the default is also gone
      expect(() => registry.unregister(null)).toThrow(
        'Item with ID "null" is not registered.',
      );
    });
  });

  describe('execute', () => {
    it('should execute a function on a registered item', async () => {
      const item = createMockItem('item1');

      registry.register('item1', item);
      const result = await registry.execute(
        'item1',
        (e: Mockitem) => `executed on ${e.name}`,
      );

      expect(result).toBe('executed on item1');
    });

    it('should queue a function to be executed when the item is registered', async () => {
      const promise = registry.execute(
        'item1',
        (e: Mockitem) => `executed on ${e.name}`,
      );

      // It shouldn't resolve yet
      const onResolve = vi.fn();

      void promise.then(onResolve);
      await new Promise(resolve => setTimeout(resolve, 0)); // wait for promise to potentially resolve

      expect(onResolve).not.toHaveBeenCalled();

      const item = createMockItem('item1');

      registry.register('item1', item);

      const result = await promise;

      expect(result).toBe('executed on item1');
      expect(onResolve).toHaveBeenCalledWith('executed on item1');
    });

    it('should execute multiple queued functions for the same item', async () => {
      const promise1 = registry.execute(
        'item1',
        (e: Mockitem) => `executed 1 on ${e.name}`,
      );
      const promise2 = registry.execute(
        'item1',
        (e: Mockitem) => `executed 2 on ${e.name}`,
      );
      const item = createMockItem('item1');

      registry.register('item1', item);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe('executed 1 on item1');
      expect(result2).toBe('executed 2 on item1');
    });

    it('should work with the default item', async () => {
      const item1 = createMockItem('item1');

      registry.register('item1', item1); // Registers as default

      const result = await registry.execute(
        null,
        (e: Mockitem) => `executed on default ${e.name}`,
      );

      expect(result).toBe('executed on default item1');
    });
  });

  describe('getitems', () => {
    it('should return all registered items', () => {
      const item1 = createMockItem('item1');
      const item2 = createMockItem('item2');

      registry.register('item1', item1);
      registry.register('item2', item2);

      const items = registry.getItems();

      expect(items).toHaveLength(3); // item1, item2, and default (which is item1)
      expect(items).toContain(item1);
      expect(items).toContain(item2);
    });

    it('should return unique items if some point to the same instance', () => {
      const item1 = createMockItem('item1');

      registry.register('item1', item1); // This also registers it as default

      const items = registry.getItems();

      expect(items).toHaveLength(2); // item1 and default (which is item1)
      expect(items.filter(e => e === item1)).toHaveLength(2);
    });
  });

  describe('hasitem', () => {
    it('should return true if an item with the given ID is registered', () => {
      const item = createMockItem('item1');

      registry.register('item1', item);

      expect(registry.hasItem('item1')).toBe(true);
    });

    it('should return false if an item with the given ID is not registered', () => {
      expect(registry.hasItem('nonexistent')).toBe(false);
    });
  });

  describe('waitForitem', () => {
    it('should return a promise that resolves with the item instance', async () => {
      const item1 = createMockItem('item1');
      registry.register('item1', item1);

      const result = await registry.waitFor('item1');

      expect(result).toBe(item1);
    });

    it('should wait for the item to be registered before resolving', async () => {
      const promise = registry.waitFor('item1');
      const item1 = createMockItem('item1');

      registry.register('item1', item1);

      expect(await promise).toBe(item1);
    });
  });

  describe('destroyAllitems', () => {
    it('should destroy all registered items', async () => {
      const item1 = createMockItem('item1');
      const item2 = createMockItem('item2');

      registry.register('item1', item1);
      registry.register('item2', item2);

      await registry.destroyAll();

      expect(registry.getItems()).toHaveLength(0);
    });

    it('should clear the registry after destroying all items', async () => {
      const item1 = createMockItem('item1');

      registry.register('item1', item1);

      await registry.destroyAll();

      expect(registry.getItems()).toHaveLength(0);
    });
  });

  describe('watch/unwatch', () => {
    it('should call watcher immediately with current items state', () => {
      const item1 = createMockItem('item1');
      registry.register('item1', item1);

      const watcher = vi.fn();
      registry.watch(watcher);

      expect(watcher).toHaveBeenCalledOnce();
      expect(watcher).toHaveBeenCalledWith(expect.any(Map));

      const callArgs = watcher.mock.calls[0]![0] as Map<string | null, any>;
      expect(callArgs.get('item1')).toBe(item1);
      expect(callArgs.get(null)).toBe(item1); // default item
    });

    it('should call watcher when item is registered', () => {
      const watcher = vi.fn();
      registry.watch(watcher);

      expect(watcher).toHaveBeenCalledTimes(1); // Initial call

      const item1 = createMockItem('item1');
      registry.register('item1', item1);

      expect(watcher).toHaveBeenCalledTimes(3); // Initial + register + default register
    });

    it('should call watcher when item is unregistered', () => {
      const item1 = createMockItem('item1');
      registry.register('item1', item1);

      const watcher = vi.fn();
      registry.watch(watcher);

      watcher.mockClear(); // Clear initial call

      registry.unregister('item1');

      expect(watcher).toHaveBeenCalledTimes(2); // Unregister + default unregister
    });

    it('should call watcher when all items are destroyed', async () => {
      const item1 = createMockItem('item1');
      const item2 = createMockItem('item2');
      registry.register('item1', item1);
      registry.register('item2', item2);

      const watcher = vi.fn();
      registry.watch(watcher);

      watcher.mockClear(); // Clear initial call

      await registry.destroyAll();

      expect(watcher).toHaveBeenCalledOnce();

      const callArgs = watcher.mock.calls[0]![0] as Map<string | null, any>;
      expect(callArgs.size).toBe(0);
    });

    it('should allow multiple watchers', () => {
      const watcher1 = vi.fn();
      const watcher2 = vi.fn();

      registry.watch(watcher1);
      registry.watch(watcher2);

      const item1 = createMockItem('item1');
      registry.register('item1', item1);

      expect(watcher1).toHaveBeenCalled();
      expect(watcher2).toHaveBeenCalled();
    });

    it('should provide a copy of items map to watchers', () => {
      const item1 = createMockItem('item1');
      registry.register('item1', item1);

      const watcher = vi.fn();
      registry.watch(watcher);

      const receivedMap = watcher.mock.calls[0]![0] as Map<string | null, any>;

      // Modifying the received map should not affect the internal state
      receivedMap.clear();

      expect(registry.getItems()).toHaveLength(2); // Still has item1 and default
    });

    it('should stop calling watcher after unwatch', () => {
      const watcher = vi.fn();
      registry.watch(watcher);

      registry.unwatch(watcher);
      watcher.mockClear();

      const item1 = createMockItem('item1');
      registry.register('item1', item1);

      expect(watcher).not.toHaveBeenCalled();
    });

    it('should return unwatch function from watch', () => {
      const watcher = vi.fn();
      const unwatch = registry.watch(watcher);

      unwatch();
      watcher.mockClear();

      const item1 = createMockItem('item1');
      registry.register('item1', item1);

      expect(watcher).not.toHaveBeenCalled();
    });

    it('should handle unwatching non-existent watcher gracefully', () => {
      const watcher = vi.fn();

      expect(() => registry.unwatch(watcher)).not.toThrow();
    });
  });
});

type Mockitem = Destructible & {
  name: string;
};

function createMockItem(name: string): Mockitem {
  return {
    name,
    destroy: () => {},
  } as unknown as Mockitem;
}
