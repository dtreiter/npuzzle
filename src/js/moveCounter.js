import m from 'mithril';

export class MoveCounter {
  constructor() {
    this.count = 0;
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
    return m('h3', 'Moves: ' + this.count);
  }
}
