import { html } from '../html';
import { DEFAULT_TEST_EDITOR_ID } from './wait-for-test-editor';

/**
 * Creates an editor element with the given configuration.
 */
export function createEditorHtmlElement(
  {
    id = DEFAULT_TEST_EDITOR_ID,
    name,
    required,
    withInput,
    class: className,
    style,
    content,
  }: {
    id?: string;
    name?: string;
    required?: boolean;
    withInput?: boolean;
    class?: string;
    style?: string;
    content?: string;
  } = {},
) {
  return html.div(
    {
      id,
      ...(className && { class: className }),
      ...(style && { style }),
    },
    html.div({
      id: `${id}_editor`,
    }),
    withInput && html.input({
      type: 'hidden',
      id: `${id}_input`,
      name,
      value: content || '',
      required: required ? 'required' : undefined,
    }),
  );
}
