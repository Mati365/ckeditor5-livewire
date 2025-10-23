import { uid } from '../../src/shared';
import { html } from '../html';

/**
 * Creates a UI part element for testing.
 */
export function createUIPartHtmlElement(
  {
    id = `ui-part-${uid()}`,
  }: {
    id?: string;
  } = {},
) {
  return html.div({
    id,
  });
}

export function queryUIPartElement(uiPartId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`#${uiPartId}`);
}
