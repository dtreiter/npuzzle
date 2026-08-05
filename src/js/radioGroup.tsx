import m from 'mithril';

interface RadioGroupAttrs {
  readonly name: string;
  readonly initialValue: string;
  readonly options: Array<{
    value: string;
    label: string;
  }>
  readonly onChange: (value: string) => void; // Runs when the value changes
}

export class RadioGroup implements m.Component<RadioGroupAttrs> {
  private value: string;

  constructor({attrs}: m.Vnode<RadioGroupAttrs>) {
    const {initialValue} = attrs;
    this.value = initialValue;
  }

  view({attrs}: m.Vnode<RadioGroupAttrs, this>) {
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
      const input = (
        <input
          type='radio'
          name={name}
          id={id}
          value={option.value}
          checked={option.value === this.value}
          onchange={() => {
            this.value = option.value;
            onChange(option.value);
          }}>
            {option.value}
        </input>
      );
      const label = <label for={id}>{option.value}</label>;
      radioButtons.push(input, label);
    }

    return (
      <div class='radio-group'>
        <span class='form-label'>{name}</span>
        {radioButtons}
      </div>
    );
  }
}
