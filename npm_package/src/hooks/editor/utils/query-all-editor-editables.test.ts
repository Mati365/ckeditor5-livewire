import { beforeEach, describe, expect, it } from 'vitest';

import { queryAllEditorEditables } from './query-all-editor-editables';

describe('queryAllEditorEditables', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should return empty object when no editables found', () => {
    const result = queryAllEditorEditables('test-editor');
    expect(result).toEqual({});
  });

  it('should find editables with specific editor ID', () => {
    document.body.innerHTML = `
      <div data-cke-editor-id="test-editor" data-cke-editable-root-name="main" data-cke-editable-initial-value="Initial content">
        <div data-cke-editable-content>Content area</div>
      </div>
    `;

    const result = queryAllEditorEditables('test-editor');

    expect(result).toHaveProperty('main');
    expect(result['main']?.content).toBeInstanceOf(HTMLElement);
    expect(result['main']?.initialValue).toBe('Initial content');
  });

  it('should find editables without editor ID (fallback)', () => {
    document.body.innerHTML = `
      <div data-cke-editable-root-name="main" data-cke-editable-initial-value="Initial content">
        <div data-cke-editable-content>Content area</div>
      </div>
    `;

    const result = queryAllEditorEditables('any-editor');

    expect(result).toHaveProperty('main');
    expect(result['main']?.content).toBeInstanceOf(HTMLElement);
    expect(result['main']?.initialValue).toBe('Initial content');
  });

  it('should handle multiple editables', () => {
    document.body.innerHTML = `
      <div data-cke-editor-id="test-editor" data-cke-editable-root-name="main" data-cke-editable-initial-value="Main content">
        <div data-cke-editable-content>Main area</div>
      </div>
      <div data-cke-editor-id="test-editor" data-cke-editable-root-name="sidebar" data-cke-editable-initial-value="Sidebar content">
        <div data-cke-editable-content>Sidebar area</div>
      </div>
    `;

    const result = queryAllEditorEditables('test-editor');

    expect(Object.keys(result)).toHaveLength(2);
    expect(result).toHaveProperty('main');
    expect(result).toHaveProperty('sidebar');
    expect(result['main']?.initialValue).toBe('Main content');
    expect(result['sidebar']?.initialValue).toBe('Sidebar content');
  });

  it('should ignore editables without content element', () => {
    document.body.innerHTML = `
      <div data-cke-editor-id="test-editor" data-cke-editable-root-name="main" data-cke-editable-initial-value="Initial content">
        <!-- No content element -->
      </div>
    `;

    const result = queryAllEditorEditables('test-editor');

    expect(result).toEqual({});
  });

  it('should ignore editables without name attribute', () => {
    document.body.innerHTML = `
      <div data-cke-editor-id="test-editor" data-cke-editable-initial-value="Initial content">
        <div data-cke-editable-content>Content area</div>
      </div>
    `;

    const result = queryAllEditorEditables('test-editor');

    expect(result).toEqual({});
  });

  it('should use empty string as default initial value', () => {
    document.body.innerHTML = `
      <div data-cke-editor-id="test-editor" data-cke-editable-root-name="main">
        <div data-cke-editable-content>Content area</div>
      </div>
    `;

    const result = queryAllEditorEditables('test-editor');

    expect(result).toHaveProperty('main');
    expect(result['main']?.initialValue).toBe('');
  });

  it('should filter by specific editor ID', () => {
    document.body.innerHTML = `
      <div data-cke-editor-id="editor1" data-cke-editable-root-name="main" data-cke-editable-initial-value="Editor 1 content">
        <div data-cke-editable-content>Editor 1 area</div>
      </div>
      <div data-cke-editor-id="editor2" data-cke-editable-root-name="main" data-cke-editable-initial-value="Editor 2 content">
        <div data-cke-editable-content>Editor 2 area</div>
      </div>
    `;

    const result1 = queryAllEditorEditables('editor1');
    const result2 = queryAllEditorEditables('editor2');

    expect(result1).toHaveProperty('main');
    expect(result1['main']?.initialValue).toBe('Editor 1 content');

    expect(result2).toHaveProperty('main');
    expect(result2['main']?.initialValue).toBe('Editor 2 content');
  });

  it('should handle complex nested structures', () => {
    document.body.innerHTML = `
      <div class="editor-container">
        <div data-cke-editor-id="test-editor" data-cke-editable-root-name="header" data-cke-editable-initial-value="Header content">
          <div class="wrapper">
            <div data-cke-editable-content class="content-area">Header area</div>
          </div>
        </div>
        <div data-cke-editor-id="test-editor" data-cke-editable-root-name="body" data-cke-editable-initial-value="Body content">
          <div data-cke-editable-content>Body area</div>
        </div>
      </div>
    `;

    const result = queryAllEditorEditables('test-editor');

    expect(Object.keys(result)).toHaveLength(2);
    expect(result).toHaveProperty('header');
    expect(result).toHaveProperty('body');
    expect(result['header']?.content.className).toBe('content-area');
  });
});
