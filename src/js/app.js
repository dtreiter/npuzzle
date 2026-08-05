import m from 'mithril';
import {Puzzle} from './puzzle.js';
import {Controls} from './controls.js';

export class App {
  constructor() {
    // TODO Make puzzle a mithril component.
    // Create puzzle instance.
    this.size = Number(m.route.param('size'));
    if (isNaN(this.size)) {
      this.size = 4;
    } else if (this.size < 3) {
      this.size = 3;
    } else if (this.size > 5) {
      this.size = 5;
    }

    let initialState = m.route.param('state');
    if (initialState) {
      initialState = initialState.split(',');
    }

    const blind = Boolean(m.route.param('blind'));
    this.createPuzzle({
      size: this.size,
      blind,
      initialState,
    });
  }

  createPuzzle({size, blind, initialState}) {
    const $container = $('#puzzle');
    if (this.puzzle) {
      delete this.puzzle;
      // Clear out old tile divs
      $container[0].replaceChildren();
    }

    this.size = size;

    const puzzle = new Puzzle({
      $container,
      size: size,
      blind: blind,
      initialState: initialState,
    });

    this.puzzle = puzzle;
  }

  view() {
    return m(Controls, {
      puzzle: this.puzzle,
      size: this.size,
      blind: this.blind,
      createPuzzle: this.createPuzzle,
    })
  }
}
