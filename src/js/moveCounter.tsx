import m from 'mithril';
import $ from 'jquery';

export class MoveCounter implements m.Component {
  private count = 0;

  constructor() {
    $(document).on('puzzle:move', () => {
      this.count = this.count + 1;
      m.redraw();
    });

    $(document).on('puzzle:scramble', () => {
      this.count = 0;
      m.redraw();
    });
  }

  view() {
    return <h3>Moves: {this.count}</h3>;
  }
}
