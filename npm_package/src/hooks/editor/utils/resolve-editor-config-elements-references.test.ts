import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveEditorConfigElementReferences } from './resolve-editor-config-elements-references';

describe('resolveEditorConfigElementReferences', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('resolves a single element reference', () => {
    const div = document.createElement('div');
    div.id = 'test-div';
    document.body.appendChild(div);

    const config = {
      foo: { $element: '#test-div' },
    };

    const result = resolveEditorConfigElementReferences(config);
    expect(result.foo).toBe(div);
  });

  it('returns null if element not found', () => {
    const config = {
      foo: { $element: '#not-exist' },
    };
    const result = resolveEditorConfigElementReferences(config);

    expect(result.foo).toBeNull();
  });

  it('recursively resolves nested element references', () => {
    const span = document.createElement('span');
    span.className = 'my-span';
    document.body.appendChild(span);

    const config = {
      nested: {
        bar: { $element: '.my-span' },
      },
    };

    const result = resolveEditorConfigElementReferences(config);
    expect(result.nested.bar).toBe(span);
  });

  it('resolves element references in arrays', () => {
    const el1 = document.createElement('div');
    el1.id = 'el1';
    document.body.appendChild(el1);

    const el2 = document.createElement('div');
    el2.id = 'el2';
    document.body.appendChild(el2);

    const config = [
      { $element: '#el1' },
      { $element: '#el2' },
      { notElement: 123 },
    ];

    const result = resolveEditorConfigElementReferences(config);

    expect(result[0]).toBe(el1);
    expect(result[1]).toBe(el2);
    expect(result[2]).toEqual({ notElement: 123 });
  });

  it('returns primitives as is', () => {
    expect(resolveEditorConfigElementReferences(42)).toBe(42);
    expect(resolveEditorConfigElementReferences('foo')).toBe('foo');
    expect(resolveEditorConfigElementReferences(null)).toBe(null);
    expect(resolveEditorConfigElementReferences(undefined)).toBe(undefined);
  });

  it('warns for invalid selector type', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const config = { foo: { $element: '.foo' } };

    resolveEditorConfigElementReferences(config);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Element not found for selector: .foo'));
    warnSpy.mockRestore();
  });

  it('warns if element not found', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const config = { foo: { $element: '#not-found' } };

    resolveEditorConfigElementReferences(config);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Element not found'));
    warnSpy.mockRestore();
  });
});
