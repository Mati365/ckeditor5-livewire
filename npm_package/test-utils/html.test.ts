import { describe, expect, it } from 'vitest';

import { html } from './html';

describe('html utility', () => {
  it('should create a simple HTML element without attributes or children', () => {
    const element = html.div();
    expect(element).toBeInstanceOf(HTMLDivElement);
    expect(element.tagName).toBe('DIV');
    expect(element.attributes.length).toBe(0);
    expect(element.childNodes.length).toBe(0);
  });

  it('should create an element with attributes', () => {
    const element = html.a({ 'href': '#', 'id': 'link', 'data-test': 'true' });
    expect(element).toBeInstanceOf(HTMLAnchorElement);
    expect(element.getAttribute('href')).toBe('#');
    expect(element.id).toBe('link');
    expect(element.dataset['test']).toBe('true');
  });

  it('should create an element with a single string child', () => {
    const element = html.p('Hello world');
    expect(element).toBeInstanceOf(HTMLParagraphElement);
    expect(element.textContent).toBe('Hello world');
  });

  it('should create an element with a single element child', () => {
    const child = html.span('I am a child');
    const parent = html.div(child);
    expect(parent.childNodes.length).toBe(1);
    expect(parent.firstChild).toBe(child);
  });

  it('should create an element with multiple children', () => {
    const element = html.p(
      'This is a ',
      html.strong('bold'),
      ' text with a ',
      html.em('italic'),
      ' word.',
    );
    expect(element.innerHTML).toBe('This is a <strong>bold</strong> text with a <em>italic</em> word.');
  });

  it('should handle boolean attributes correctly', () => {
    const enabledButton = html.button({ disabled: false });
    expect(enabledButton.disabled).toBe(false);
    expect(enabledButton.hasAttribute('disabled')).toBe(false);

    const disabledButton = html.button({ disabled: true });
    expect(disabledButton.disabled).toBe(true);
    expect(disabledButton.hasAttribute('disabled')).toBe(true);
    expect(disabledButton.getAttribute('disabled')).toBe('');
  });

  it('should ignore null and undefined children', () => {
    const element = html.div('Hello', null, ' world', undefined, '!');
    expect(element.textContent).toBe('Hello world!');
  });

  it('should treat the first argument as a child if it is a string or a node', () => {
    const p1 = html.p('Hello');
    expect(p1.textContent).toBe('Hello');
    expect(p1.attributes.length).toBe(0);

    const span = html.span('World');
    const p2 = html.p(span);
    expect(p2.firstChild).toBe(span);
    expect(p2.attributes.length).toBe(0);
  });

  it('should create SVG elements with the correct namespace', () => {
    const svg = html.svg({ width: '100', height: '100' });
    expect(svg).toBeInstanceOf(SVGSVGElement);
    expect(svg.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(svg.getAttribute('width')).toBe('100');

    const path = html.path({ d: 'M0 0' });
    expect(path).toBeInstanceOf(SVGPathElement);
    expect(path.namespaceURI).toBe('http://www.w3.org/2000/svg');
  });

  it('should handle nested elements correctly', () => {
    const list = html.ul(
      { class: 'list' },
      html.li({ class: 'item-1' }, 'Item 1'),
      html.li({ class: 'item-2' }, 'Item 2'),
      html.li({ class: 'item-3' }, html.a({ href: '#' }, 'Item 3')),
    );

    expect(list.outerHTML).toBe('<ul class="list"><li class="item-1">Item 1</li><li class="item-2">Item 2</li><li class="item-3"><a href="#">Item 3</a></li></ul>');
  });

  it('should handle falsy attributes but not null or undefined', () => {
    const el = html.div({
      a: 0,
      b: '',
      c: null,
      d: undefined,
    });

    expect(el.getAttribute('a')).toBe('0');
    expect(el.getAttribute('b')).toBe('');
    expect(el.hasAttribute('c')).toBe(false);
    expect(el.hasAttribute('d')).toBe(false);
  });

  it('should not crash when creating an element with falsy children', () => {
    const element = html.div({}, null, undefined, false);

    expect(element.tagName).toBe('DIV');
    expect(element.childNodes.length).toBe(0);
  });
});
