/**
 * name: string,
 * initialValue: string,
 * options: Array<{
 *   value: string,
 *   label: string,
 * }>
 * onChange: () => {}; // Runs when the value changes
 */
export class RadioGroup {
  constructor({attrs}) {
    const {initialValue} = attrs;
    this.value = initialValue;
  }

  view({attrs}) {
    const {
      name,
      options,
      onChange,
    } = attrs;

    const radioButtons = [];
    for (const option of options) {
      // TODO Make `id` specific to each RadioGroup
      // instance.
      const id = `radio-id-${option.value}`;
      const input = m('input', {
        type: 'radio',
        name,
        id,
        value: option.value,
        checked: option.value === this.value,
        onchange: () => {
          this.value = option.value;
          onChange(option.value);
        },
      }, [`${option.value}`]);
      const label = m('label', {for: id}, [`${option.value}`]);
      radioButtons.push(input, label);
    }

    return m('div', [
      m('form', [
        m('span', {class: 'form-label'}, [`${name}:`]),
        radioButtons,
      ]),
    ]);
  }
}
