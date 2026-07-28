import {MoveCounter} from './moveCounter.js';
import {TimeCounter} from './timeCounter.js';

export const Controls = {
  controller: function(args) {
    return {
      puzzle: args.puzzle
    };
  },

  view: function(ctrl) {
    return m('div', [
      m('button', {
        class: 'button primary',
        onclick: ctrl.puzzle.scramble.bind(ctrl.puzzle)
      }, 'Scramble'),
      m('button', {
        class: 'button secondary',
        onclick: ctrl.puzzle.solve.bind(ctrl.puzzle)
      }, 'Solve'),
      m.component(TimeCounter),
      m.component(MoveCounter)
    ]);
  }
};
