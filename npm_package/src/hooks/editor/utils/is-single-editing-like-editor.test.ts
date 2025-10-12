import { describe, expect, it } from 'vitest';

import type { EditorType } from '../typings';

import { isSingleEditingLikeEditor } from './is-single-editing-like-editor';

describe('isSingleEditingLikeEditor', () => {
  it('should return true for inline editor', () => {
    expect(isSingleEditingLikeEditor('inline')).toBe(true);
  });

  it('should return true for classic editor', () => {
    expect(isSingleEditingLikeEditor('classic')).toBe(true);
  });

  it('should return true for balloon editor', () => {
    expect(isSingleEditingLikeEditor('balloon')).toBe(true);
  });

  it('should return false for decoupled editor', () => {
    expect(isSingleEditingLikeEditor('decoupled')).toBe(true);
  });

  it('should return false for multiroot editor', () => {
    expect(isSingleEditingLikeEditor('multiroot')).toBe(false);
  });

  it('should handle all valid editor types', () => {
    const singleEditingTypes: EditorType[] = ['inline', 'classic', 'balloon', 'decoupled'];
    const multiEditingTypes: EditorType[] = ['multiroot'];

    singleEditingTypes.forEach((type) => {
      expect(isSingleEditingLikeEditor(type)).toBe(true);
    });

    multiEditingTypes.forEach((type) => {
      expect(isSingleEditingLikeEditor(type)).toBe(false);
    });
  });
});
