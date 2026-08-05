import {MoveCounter} from './moveCounter.js';
import {RadioGroup} from './radioGroup.js';
import {TimeCounter} from './timeCounter.js';

export class Controls {
  constructor({attrs}) {
    this.puzzle = attrs.puzzle;
    this.size = attrs.size;
    this.blind = attrs.blind;
    this.createPuzzle = attrs.createPuzzle;
  }

  view() {
    return m('div', [
      m('button', {
        class: 'button primary',
        onclick: this.puzzle.scramble.bind(this.puzzle)
      }, 'Scramble'),
      m('button', {
        class: 'button secondary',
        disabled: this.size > 3 ? true : undefined,
        onclick: this.puzzle.solve.bind(this.puzzle)
      }, 'Solve'),
      m(RadioGroup, {
        name: 'Size',
        initialValue: `${this.size}`,
        options: [
          {value: '3', label: '3'},
          {value: '4', label: '4'},
          {value: '5', label: '5'},
        ],
        onChange: (value) => {
          this.size = value;
          this.createPuzzle({
            size: this.size,
            blind: this.blind,
          });
        }
      }),
      m(TimeCounter),
      m(MoveCounter),
    ]);
  }
}
