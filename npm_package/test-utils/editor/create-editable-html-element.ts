import { html } from '../html';

/**
 * Creates a editable element with the given name and initial value.
 */
export function createEditableHtmlElement(
  {
    id,
    name,
    required,
    withInput,
  }: {
    id: string;
    name?: string;
    required?: boolean;
    withInput?: boolean;
  },
) {
  return html.div(
    {
      id,
    },
    html.div({
      'data-cke-editable-content': '',
    }),
    withInput && html.input({
      type: 'hidden',
      id: `${id}_input`,
      required: required ? 'required' : undefined,
      name,
    }),
  );
}
