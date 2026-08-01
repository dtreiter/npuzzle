import {MoveCounter} from './moveCounter.js';
import {TimeCounter} from './timeCounter.js';

export class Controls {
  constructor(vnode) {
    this.puzzle = vnode.attrs.puzzle;
  }

  view() {
    return m('div', [
      m('button', {
        class: 'button primary',
        onclick: this.puzzle.scramble.bind(this.puzzle)
      }, 'Scramble'),
      m('button', {
        class: 'button secondary',
        onclick: this.puzzle.solve.bind(this.puzzle)
      }, 'Solve'),
      m(TimeCounter),
      m(MoveCounter)
    ]);
  }
}
