import $ from 'jquery';
import {solve} from './solver.js';
import {
  fadeAndScale,
  rotate,
  translate
} from './animate.js';

const TimeConstants = {
  SLIDE: 50,
  FADE: 500,
  WAIT: 300,
  SCRAMBLE: 1200,
  SHAKE: 200,
};

class Tile {
  constructor({
    $container,
    row,
    col,
    size,
    number,
    visible,
  }) {
    this.$container = $container;
    this.row = row;
    this.col = col;
    this.size = size;
    this.number = number;
    this.visible = visible;

    this.$el = this._createTileDiv();
    this.$container.append(this.$el);
    this._setupClickHandler();

    if (!this.visible) {
      setTimeout(() => {
        this.hide();
      }, TimeConstants.WAIT);
    }
  }

  move(row, col) {
    const pos = this._getRectPosition(row, col);
    translate({
      el: this.$el[0],
      pos,
      duration: TimeConstants.SLIDE}
    );

    this.row = row;
    this.col = col;
  }

  isEmpty() {
    return !this.visible;
  }

  hide() {
    fadeAndScale({
      el: this.$el[0],
      opacity: 0,
      scale: 0.8,
      duration: TimeConstants.FADE,
    });
  }

  /*
   * Visually shakes the tile.
   */
  async animateSolved() {
    const rotation = 5; // Degrees
    const el = this.$el[0];

    const straighten = () => {
      return rotate({
        el,
        degrees: 0,
        duration: TimeConstants.SHAKE
      });
    };

    const shake = async () => {
      // Restore the hidden tile.
      fadeAndScale({
        el,
        scale: 1,
        opacity: 1.0,
        duration: TimeConstants.SHAKE,
      });
      await rotate({
        el,
        degrees: rotation,
        duration: TimeConstants.SHAKE,
      });
      await rotate({
        el,
        degrees: -rotation,
        duration: TimeConstants.SHAKE
      });
    }

    await shake();
    await shake();
    await shake();
    await straighten();
  }

  _createTileDiv() {
    const pos = this._getRectPosition(this.row, this.col);
    return $('<div>')
      .html(String(this.number))
      .addClass('tile')
      .css({
        'width': String(this.size) + 'px',
        'height': String(this.size) + 'px',
        'line-height': String(this.size) + 'px',
        'left': pos.x,
        'top': pos.y,
      });
  }

  _setupClickHandler() {
    this.$el.on('touchstart click', (e) => {
      $(document).triggerHandler('puzzle:tile:click', {
        row: this.row,
        col: this.col
      });

      // If the `touchstart` event is triggered, prevent the `click`
      // event from firing.
      e.preventDefault();
    });
  }

  _getRectPosition(row, col) {
    return {
      x: this.size * col,
      y: this.size * row,
    }
  }
}


export class Puzzle {
  constructor({
    $container,
    size,
    initialState,
    blind,
  }) {
    this.$container = $container;
    this.size = size;
    this.initialState = initialState;
    this.blind = Boolean(blind);

    this.width = this.$container.width();
    this.height = this.width;

    this._States = {
      SOLVED: 0,
      SCRAMBLING: 1,
      SCRAMBLED: 2,
      SOLVING: 3,
    };
    this._state = this._States.SOLVED;

    // Due to using absolute css positioning, the #puzzle container div
    // cannot know it's height -- set it manually here.
    this.$container.height(this.height);

    this.tiles = [];
    this._generateTiles();

    // Listen for click events on tiles.
    $(document).on('puzzle:tile:click', (e, pos) => {
      if (this._state === this._States.SCRAMBLED) {
        // Hide labels if blind-mode is enabled.
        if (this.blind) {
          this._hideLabels();
        }

        this.move(pos.row, pos.col);
      }
    });

    // If a state was provided, set the puzzle to that. Otherwise,
    // scramble it.
    if (this.initialState) {
      setTimeout(
        this._setInitialState.bind(this, this.initialState),
        TimeConstants.SCRAMBLE
      );
    } else {
      setTimeout(this.scramble.bind(this), TimeConstants.SCRAMBLE);
    }
  }

  _generateTiles() {
    const tileSize = this.width / this.size;
    for (let row = 0; row < this.size; row++) {
      this.tiles.push([]);
      for (let col = 0; col < this.size; col++) {
        const num = this.size * row + col + 1;

        let visible = true;
        if (num === this.size * this.size) {
          // The empty space is represented as a hidden tile for simplicity.
          visible = false;
        }

        this.tiles[row].push(new Tile({
          $container: this.$container,
          visible: visible,
          size: tileSize,
          row: row,
          col: col,
          number: num,
        }));
      }
    }
  }

  _findEmptyTile() {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.tiles[row][col].isEmpty()) {
          return {
            row: row,
            col: col,
          };
        }
      }
    }
  }

  /*
   * Determines if the empty square is in the same row / col as the provided
   * (row, col). Returns the empty square's location if so.
   *
   * The basic algorithm is to start at (row, col) and step outward in all 4
   * directions looking for the empty tile.
   */
  _findEmptyTileSameRowCol(row, col) {
    // The max distance in any direction to the end of the puzzle.
    const maxDistance = Math.max(row, col, this.size - row, this.size - col);

    for (let i = 1; i <= maxDistance; i++) {
      if (this._isEmpty(row - i, col)) {
        return {
          row: row - i,
          col: col,
        }
      }
      else if (this._isEmpty(row + i, col)) {
        return {
          row: row + i,
          col: col,
        }
      }
      else if (this._isEmpty(row, col - i)) {
        return {
          row: row,
          col: col - i,
        }
      }
      else if (this._isEmpty(row, col + i)) {
        return {
          row: row,
          col: col + i,
        }
      }
    }

    return null;
  }

  /*
   * Determines if the tile at (row, col) is the empty tile.
   */
  _isEmpty(row, col) {
    // Check if out of bounds.
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
      return false;
    }

    return this.tiles[row][col].isEmpty();
  }

  /*
   * Moves a row / column of tiles in the interval (start, end).
   *
   * The idea is to start at the end (the empty square) and move each tile
   * preceding it until reaching start.
   */
  _moveTiles(start, end) {
    const emptyTile = this.tiles[end.row][end.col];

    // Create a normalized direction vector.
    const direction = {
      r: start.row - end.row,
      c: start.col - end.col,
    };
    // Normalize
    if (direction.r != 0) direction.r /= Math.abs(direction.r);
    if (direction.c != 0) direction.c /= Math.abs(direction.c);

    let row = end.row;
    let col = end.col;
    while (row != start.row || col != start.col) {
      const nextRow = row + direction.r;
      const nextCol = col + direction.c;
      this.tiles[row][col] = this.tiles[nextRow][nextCol];
      this.tiles[row][col].move(row, col);

      row = nextRow;
      col = nextCol;
    }

    this.tiles[row][col] = emptyTile;
    emptyTile.move(row, col);
  }

  move(row, col) {
    // Don't allow moving when in the solved state.
    if (this._state === this._States.SOLVED) {
      return;
    }

    const emptyTile = this._findEmptyTileSameRowCol(row, col);
    if (emptyTile !== null) {
      this._moveTiles({row: row, col: col}, emptyTile);
      $(document).triggerHandler('puzzle:move');

      if ((this._state === this._States.SCRAMBLED
          || this._state === this._States.SOLVING)
          && this.isSolved()) {
        this._state = this._States.SOLVED;
        $(document).triggerHandler('puzzle:solved');
        this._animateSolved();
      }
    }
  }

  /*
   * Executes a sequence of moves provided as an array of
   * `{row: row, col: col}` objects.
   */
  moveSequence(sequence) {
      const pos = sequence.shift();
      if (pos) {
        this.move(pos.row, pos.col);
        setTimeout(this.moveSequence.bind(this, sequence), 3 * TimeConstants.SLIDE);
      }
  }

  isSolved() {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const num = row * this.size + col + 1;
        if (this.tiles[row][col].number !== num) {
          return false;
        }
      }
    }

    return true;
  }

  /*
   * Takes a state represented as an array of numbers and puts the puzzle
   * in that state. Depends on the puzzle being in the solved state.
   */
  _setInitialState(state) {
    if (state.length !== this.size * this.size) {
      throw new Error('Provided state is invalid!');
    }

    // Make a mapping of number labels to their location in the provided
    // state. This prevents repeatedly searching the provided state
    // array further down.
    const labelToState = {};
    state.forEach((num, i) => {
      // Ensure valid / non-duplicate numbers are provided.
      num = Number(num);
      if (num <= 0
          || num > this.size * this.size
          || isNaN(num)
          || num in labelToState) {
        throw new Error('Provided state is invalid!');
      }

      labelToState[num] = i;
    });

    const newTiles = this._generateEmptyMatrix(this.size);
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const curTile = this.tiles[row][col];
        const curIndex = col + this.size * row + 1;
        const stateIndex = labelToState[curIndex];
        const stateRow = Math.floor(stateIndex / this.size);
        const stateCol = stateIndex % this.size;

        newTiles[stateRow][stateCol] = curTile;
        curTile.move(stateRow, stateCol);
      }
    }

    this.tiles = newTiles;
    this._state = this._States.SCRAMBLED;
  }

  /*
   * Dumps the current puzzle tile state as a matrix of numbers.
   */
  _dumpState() {
    const state = [];
    for (let row = 0; row < this.size; row++) {
      state.push([]);
      for (let col = 0; col < this.size; col++) {
        state[row].push(this.tiles[row][col].number);
      }
    }

    return state;
  }

  _hideLabels() {
    $('div.tile').css('color', 'rgba(0,0,0,0)');
  }

  _showLabels() {
    $('div.tile').css('color', 'rgba(0,0,0,1)');
  }

  /*
   * Finds a solution using `solve` and executes the solution on the
   * puzzle.
   */
  solve() {
    if (this._state !== this._States.SCRAMBLED) {
      return;
    }

    this._state = this._States.SOLVING;
    const path = solve(this._dumpState());
    this.moveSequence.bind(this, path)();
  }

  _generateEmptyMatrix(size) {
    const matrix = [];
    for (let i = 0; i < size; i++) {
      matrix.push(Array(size));
    }

    return matrix;
  }

  /*
   * Restores the puzzle to the solved state.
   *
   * Works by creating a new tile array, putting the tiles in the right
   * place, then replacing `this.tiles` with the new array.
   */
  reset() {
    const newTiles = this._generateEmptyMatrix(this.size);
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const curTile = this.tiles[row][col];
        const curNum = curTile.number;
        const curRow = Math.floor((curNum - 1) / this.size);
        const curCol = (curNum - 1) % this.size;

        newTiles[curRow][curCol] = curTile;
        curTile.move(curRow, curCol);
      }
    }

    this.tiles = newTiles;
    this._state = this._States.SOLVED;
  }

  /*
   * Scrambles the puzzle.
   *
   * The idea is to move the empty tile around randomly for about
   * `C * numTiles` moves, where `C` is large.
   */
  scramble() {
    if (this.blind) {
      this._showLabels();
    }

    // Prevent scrambling while the puzzle is in states like SOLVING.
    if (this._state !== this._States.SOLVED
        && this._state !== this._States.SCRAMBLED) {
      return;
    }

    this._state = this._States.SCRAMBLING;
    this._hideEmptyTile();

    const numTiles = this.size * this.size;
    const numMoves = 30 * numTiles;

    const pos = this._findEmptyTile();
    const emptyTile = this.tiles[pos.row][pos.col];
    for (let i = 0; i < numMoves; i++) {
      let row = emptyTile.row;
      let col = emptyTile.col;
      const direction = Math.floor(4 * Math.random());

      if (direction === 0 && row - 1 >= 0) {
        row = row - 1;
      }
      else if (direction === 1 && row + 1 < this.size) {
        row = row + 1;
      }
      else if (direction === 2 && col - 1 >= 0) {
        col = col - 1;
      }
      else if (direction === 3 && col + 1 < this.size) {
        col = col + 1;
      }

      this.move(row, col);
    }

    this._state = this._States.SCRAMBLED;
    $(document).triggerHandler('puzzle:scramble');
  }

  _hideEmptyTile() {
    const pos = this._findEmptyTile();
    this.tiles[pos.row][pos.col].hide();
  }

  _animateSolved() {
    if (this.blind) {
      this._showLabels();
    }

    for (let row of this.tiles) {
      for (let tile of row) {
        tile.animateSolved();
      }
    }
  }
}

