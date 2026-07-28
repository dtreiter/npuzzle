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
        class: 'btn btn-lg btn-wide btn-primary',
        onclick: ctrl.puzzle.scramble.bind(ctrl.puzzle)
      }, 'Scramble'),
      m('button', {
        class: 'btn btn-lg btn-wide btn-warning',
        onclick: ctrl.puzzle.solve.bind(ctrl.puzzle)
      }, 'Solve'),
      m.component(TimeCounter),
      m.component(MoveCounter)
    ]);
  }
};
