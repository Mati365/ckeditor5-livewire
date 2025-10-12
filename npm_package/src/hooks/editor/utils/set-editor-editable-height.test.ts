import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setEditorEditableHeight } from './set-editor-editable-height';

// Mock CKEditor5 types and interfaces
const mockWriter = {
  setStyle: vi.fn(),
};

const mockRoot = {
  // Mock root element
};

const mockViewDocument = {
  getRoot: vi.fn(() => mockRoot),
};

const mockView = {
  change: vi.fn(callback => callback(mockWriter)),
  document: mockViewDocument,
};

const mockEditing = {
  view: mockView,
};

const mockEditor = {
  editing: mockEditing,
};

describe('setEditorEditableHeight', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set height style on editor root element', () => {
    const height = 300;

    setEditorEditableHeight(mockEditor as any, height);

    expect(mockView.change).toHaveBeenCalledWith(expect.any(Function));
    expect(mockViewDocument.getRoot).toHaveBeenCalled();
    expect(mockWriter.setStyle).toHaveBeenCalledWith('height', '300px', mockRoot);
  });

  it('should handle different height values', () => {
    const heights = [100, 200, 500, 1000];

    heights.forEach((height) => {
      vi.clearAllMocks();

      setEditorEditableHeight(mockEditor as any, height);

      expect(mockWriter.setStyle).toHaveBeenCalledWith('height', `${height}px`, mockRoot);
    });
  });

  it('should handle zero height', () => {
    const height = 0;

    setEditorEditableHeight(mockEditor as any, height);

    expect(mockWriter.setStyle).toHaveBeenCalledWith('height', '0px', mockRoot);
  });

  it('should handle negative height values', () => {
    const height = -100;

    setEditorEditableHeight(mockEditor as any, height);

    expect(mockWriter.setStyle).toHaveBeenCalledWith('height', '-100px', mockRoot);
  });

  it('should handle decimal height values', () => {
    const height = 250.5;

    setEditorEditableHeight(mockEditor as any, height);

    expect(mockWriter.setStyle).toHaveBeenCalledWith('height', '250.5px', mockRoot);
  });

  it('should call view.change with correct callback', () => {
    const height = 400;

    setEditorEditableHeight(mockEditor as any, height);

    expect(mockView.change).toHaveBeenCalledTimes(1);
    expect(mockView.change).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should work with different editor instances', () => {
    const anotherMockEditor = {
      editing: {
        view: {
          change: vi.fn(callback => callback(mockWriter)),
          document: {
            getRoot: vi.fn(() => mockRoot),
          },
        },
      },
    };

    const height = 350;

    setEditorEditableHeight(anotherMockEditor as any, height);

    expect(anotherMockEditor.editing.view.change).toHaveBeenCalledWith(expect.any(Function));
    expect(anotherMockEditor.editing.view.document.getRoot).toHaveBeenCalled();
    expect(mockWriter.setStyle).toHaveBeenCalledWith('height', '350px', mockRoot);
  });

  it('should handle editor with null root gracefully', () => {
    const mockEditorWithNullRoot = {
      editing: {
        view: {
          change: vi.fn(callback => callback(mockWriter)),
          document: {
            getRoot: vi.fn(() => null),
          },
        },
      },
    };

    const height = 200;

    // Should not throw error even with null root
    expect(() => setEditorEditableHeight(mockEditorWithNullRoot as any, height)).not.toThrow();

    expect(mockWriter.setStyle).toHaveBeenCalledWith('height', '200px', null);
  });
});
