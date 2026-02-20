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
    wireModel,
    withInput = true,
  }: {
    id?: string;
    name?: string;
    required?: boolean;
    withInput?: boolean;
    wireModel?: string;
  } = {},
) {
  return html.div(
    {
      id,
      ...(wireModel && { 'wire:model': wireModel }),
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
