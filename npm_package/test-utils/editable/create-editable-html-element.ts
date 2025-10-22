import { uid } from '../../src/shared';
import { html } from '../html';

/**
 * Creates a editable element with the given name and initial value.
 */
export function createEditableHtmlElement(
  {
    id = `editable-${uid()}`,
    name = `editable-${id}-input`,
    required,
    withInput = true,
  }: {
    id?: string;
    name?: string;
    required?: boolean;
    withInput?: boolean;
  } = {},
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

export function queryEditableInput(editableId: string): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>(`#${editableId} input`);
}
