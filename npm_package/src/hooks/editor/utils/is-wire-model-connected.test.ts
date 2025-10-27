import { describe, expect, it } from 'vitest';

import { html } from '../../../../test-utils/html';
import { isWireModelConnected } from './is-wire-model-connected';

describe('isWireModelConnected', () => {
  it('should return true when element has wire:model attribute', () => {
    const element = html.div({ 'wire:model': 'value' });

    expect(isWireModelConnected(element)).toBe(true);
  });

  it('should return true when element has wire:model.live attribute', () => {
    const element = html.input({ 'wire:model.live': 'value' });

    expect(isWireModelConnected(element)).toBe(true);
  });

  it('should return true when element has wire:model.defer attribute', () => {
    const element = html.input({ 'wire:model.defer': 'value' });

    expect(isWireModelConnected(element)).toBe(true);
  });

  it('should return true when parent has wire:model attribute', () => {
    const parent = html.div({ 'wire:model': 'value' });
    const child = html.input();
    parent.appendChild(child);

    expect(isWireModelConnected(child)).toBe(true);
  });

  it('should return true when ancestor has wire:model attribute', () => {
    const grandparent = html.div({ 'wire:model': 'value' });
    const parent = html.div();
    const child = html.input();

    grandparent.appendChild(parent);
    parent.appendChild(child);

    expect(isWireModelConnected(child)).toBe(true);
  });

  it('should return false when element and ancestors have no wire:model attribute', () => {
    const parent = html.div({ class: 'container' });
    const child = html.input({ id: 'test' });
    parent.appendChild(child);

    expect(isWireModelConnected(child)).toBe(false);
  });

  it('should return false for standalone element without wire:model', () => {
    const element = html.div({ class: 'test' });

    expect(isWireModelConnected(element)).toBe(false);
  });

  it('should handle deeply nested structure', () => {
    const root = html.div();
    const level1 = html.div();
    const level2 = html.div();
    const level3 = html.div({ 'wire:model': 'value' });
    const target = html.input();

    root.appendChild(level1);
    level1.appendChild(level2);
    level2.appendChild(level3);
    level3.appendChild(target);

    expect(isWireModelConnected(target)).toBe(true);
  });

  it('should return true for wire:model with different modifiers', () => {
    const testCases = [
      'wire:model.lazy',
      'wire:model.debounce',
      'wire:model.throttle',
      'wire:model.live.debounce.500ms',
    ];

    testCases.forEach((attribute) => {
      const element = html.div({ [attribute]: 'value' });
      expect(isWireModelConnected(element)).toBe(true);
    });
  });
});
