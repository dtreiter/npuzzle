import {Puzzle} from './puzzle.js';
import {Controls} from './controls.js';

export class App {
  constructor() {
    // TODO Make puzzle a mithril component.
    // Create puzzle instance.
    let size = Number(m.route.param('size'));
    if (size < 3 || isNaN(size)) {
      size = 3;
    } else if (size > 5) {
      size = 5;
    }

    let initialState = m.route.param('state');
    if (initialState) {
      initialState = initialState.split(',');
    }

    const blind = Boolean(m.route.param('blind'));

    const puzzle = new Puzzle({
      $container: $('#puzzle'),
      size: size,
      blind: blind,
      initialState: initialState
    });

    this.puzzle = puzzle;
  }

  view() {
    return m(Controls, {puzzle: this.puzzle})
  }
}
