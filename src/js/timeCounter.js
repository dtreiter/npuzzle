import m from 'mithril';

export class TimeCounter {
  constructor() {
    const defaultLabel = '0:00.00';

    this.isTiming = false;
    this.start = null;
    this.label = defaultLabel;

    $(document).on('puzzle:move', () => {
      if (!this.isTiming) {
        this.isTiming = true;
        this.start = new Date();
        m.redraw();
      }
    });

    $(document).on('puzzle:scramble', () => {
      this.isTiming = false;
      this.start = null;
      this.label = defaultLabel;
      m.redraw();
    });

    $(document).on('puzzle:solved', () => {
      this.isTiming = false;
      m.redraw();
    });

    // Formats a number to be 2 digits.
    const _formatTwoDigits = (num) => {
      num = Math.floor(num);
      if (num < 10) {
        return '0' + num;
      }

      return String(num);
    };

    const updateTime = () => {
      if (!this.isTiming) {
        return;
      }

      // Subtraction using JavaScript's Date object just gives us a time in
      // milliseconds, so we have to do some manual math here.
      const elapsed = new Date() - this.start;
      const milliSeconds = _formatTwoDigits((elapsed % 1000) / 10);
      const seconds = _formatTwoDigits((elapsed / 1000) % 60);
      const minutes = Math.floor(elapsed / 1000 / 60);
      const newLabel = `${minutes}:${seconds}.${milliSeconds}`;

      this.label = newLabel;
      m.redraw();
    };

    // If we used 100 ms exactly the 2nd millisecond digit on the clock
    // would never change. Instead we use an interval slightly under 100 ms.
    setInterval(updateTime, 93);
  }

  view() {
    return m('h3', 'Time: ' + this.label);
  }
}
