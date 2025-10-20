/**
 * Creates a proxy handler for HTML element creation with a fluent API.
 */
function createHtmlBuilder(): HtmlElementMap {
  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  const SVG_ELEMENTS = ['svg', 'use', 'title', 'path', 'rect', 'circle', 'g', 'polygon'];

  const handler: ProxyHandler<HtmlElementMap> = {
    get(_: HtmlElementMap, tag: string) {
      return (attributes = {}, ...children: any[]) => {
        if (children) {
          children = children.flat().filter(Boolean);
        }

        // If the first argument is a string or DOM element, treat it as a child
        if (typeof attributes === 'string' || attributes instanceof Node) {
          children.unshift(attributes);
          attributes = {};
        }

        // Create the element - use SVG namespace for SVG elements
        const isSvgElement = SVG_ELEMENTS.includes(tag);
        const element = (
          isSvgElement
            ? document.createElementNS(SVG_NAMESPACE, tag)
            : document.createElement(tag)
        );

        // Set attributes
        for (const [key, value] of Object.entries(attributes)) {
          if (value === true) {
            element.setAttribute(key, '');
          }
          else if (value !== false && value !== null && value !== undefined) {
            element.setAttribute(key, value as unknown as any);
          }
        }

        // Add children
        for (const child of children) {
          if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
          }
          else if (child instanceof Node) {
            element.appendChild(child);
          }
        }

        return element;
      };
    },
  };

  return new Proxy({} as any, handler) as HtmlElementMap;
}

/**
 * A proxy for creating HTML elements with a fluent API.
 *
 * @example
 * // Create a div with class 'container' and id 'main'
 * const div = html.div({ class: 'container', id: 'main' },
 *   html.span('Hello World')
 * );
 */
export const html: HtmlElementMap = createHtmlBuilder();

/**
 * Attributes object for HTML elements
 */
type HtmlAttributes = Record<string, string | number | boolean | null | undefined>;

/**
 * Content that can be passed as children to HTML elements
 */
type HtmlContent = string | Node | null | undefined | false;

/**
 * Type mapping for HTML elements
 */
type HtmlElementMap
  = & {
    [K in keyof HTMLElementTagNameMap]: (
      attributes?: HtmlAttributes | HtmlContent,
      ...children: HtmlContent[]
    ) => HTMLElementTagNameMap[K];
  }
  & {
    [K in keyof SVGElementTagNameMap]: (
      attributes?: HtmlAttributes | HtmlContent,
      ...children: HtmlContent[]
    ) => SVGElementTagNameMap[K];
  };
