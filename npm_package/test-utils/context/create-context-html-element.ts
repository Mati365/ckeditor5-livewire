import { html } from '../html';
import { DEFAULT_TEST_CONTEXT_ID } from './wait-for-test-context';

/**
 * Creates a context element for testing.
 */
export function createContextHtmlElement(
  {
    id = DEFAULT_TEST_CONTEXT_ID,
  }: {
    id?: string;
  } = {},
) {
  return html.div({
    id,
    'cke-context': '',
  });
}
