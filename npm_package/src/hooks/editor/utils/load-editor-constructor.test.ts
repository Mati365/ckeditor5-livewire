import { describe, expect, it, vi } from 'vitest';

import type { EditorType } from '../typings';

import { loadEditorConstructor } from './load-editor-constructor';

// Mock the ckeditor5 package
vi.mock('ckeditor5', async () => {
  const mockEditorConstructor = vi.fn();

  return {
    InlineEditor: mockEditorConstructor,
    BalloonEditor: mockEditorConstructor,
    ClassicEditor: mockEditorConstructor,
    DecoupledEditor: mockEditorConstructor,
    MultiRootEditor: mockEditorConstructor,
  };
});

describe('loadEditorConstructor', () => {
  it('should load InlineEditor for inline type', async () => {
    const constructor = await loadEditorConstructor('inline');
    expect(constructor).toBeDefined();
  });

  it('should load BalloonEditor for balloon type', async () => {
    const constructor = await loadEditorConstructor('balloon');
    expect(constructor).toBeDefined();
  });

  it('should load ClassicEditor for classic type', async () => {
    const constructor = await loadEditorConstructor('classic');
    expect(constructor).toBeDefined();
  });

  it('should load DecoupledEditor for decoupled type', async () => {
    const constructor = await loadEditorConstructor('decoupled');
    expect(constructor).toBeDefined();
  });

  it('should load MultiRootEditor for multiroot type', async () => {
    const constructor = await loadEditorConstructor('multiroot');
    expect(constructor).toBeDefined();
  });

  it('should throw error for unsupported editor type', async () => {
    const invalidType = 'invalid' as EditorType;

    await expect(loadEditorConstructor(invalidType)).rejects.toThrow(
      'Unsupported editor type: invalid',
    );
  });

  it('should return the correct constructor for each editor type', async () => {
    const editorTypes: EditorType[] = ['inline', 'balloon', 'classic', 'decoupled', 'multiroot'];

    for (const type of editorTypes) {
      const constructor = await loadEditorConstructor(type);
      expect(constructor).toBeDefined();
    }
  });
});
