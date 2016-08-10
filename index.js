import $ from 'jquery';
import move from 'move-js';
import React from 'react';
import ReactDOM from 'react-dom';

let Puzzle = (() => {
    'use strict';

    let TimeConstants = {
        SLIDE: 80,
        FADE: 800,
        WAIT: 300,
        SCRAMBLE: 1200,
        SHAKE: 200,
    };

    class Tile {
        constructor(opts) {
            this.$container = opts.$container;
            this.row = opts.row;
            this.col = opts.col;
            this.size = opts.size;
            this.number = opts.number;
            this.visible = opts.visible;

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
            let pos = this._getRectPosition(row, col);
            move(this.$el[0])
                .set('left', pos.x)
                .set('top', pos.y)
                .duration(TimeConstants.SLIDE)
                .end();

            this.row = row;
            this.col = col;
        }

        isEmpty() {
            return !this.visible;
        }

        hide() {
            move(this.$el[0])
                .set('opacity', 0)
                .scale(0.8)
                .duration(TimeConstants.FADE)
                .end();
        }

        /*
         * Visually shakes the tile.
         */
        animateSolved() {
            let rotation = 3; // Degrees

            let straighten = () => {
                move(this.$el[0])
                    .rotate(0)
                    .duration(TimeConstants.SHAKE)
                    .end();
            };

            let shake = (numTimes) => {
                move(this.$el[0])
                    .rotate(rotation)
                    .scale(1)
                    .set('opacity', 1.0)
                    .duration(TimeConstants.SHAKE)
                    .then()
                        .rotate(-2 * rotation)
                        .duration(TimeConstants.SHAKE)
                        .pop()
                    .end(() => {
                        setTimeout(() => {
                            if (numTimes > 0) {
                                shake(numTimes - 1);
                            }
                            else {
                                straighten();
                            }
                        }, TimeConstants.SHAKE);
                    });
            }

            shake(3);
        }

        _createTileDiv() {
            let pos = this._getRectPosition(this.row, this.col);
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


    class Puzzle {
        constructor(opts) {
            this.$container = opts.$container;
            this.size = opts.size;

            this.width = this.$container.width();
            this.height = this.width;

            this._States = {
                SOLVED: 0,
                SCRAMBLING: 1,
                SCRAMBLED: 2,
            };
            this._state = this._States.SOLVED;

            // Due to using absolute css positioning, the #puzzle container div
            // cannot know it's height -- set it manually here.
            this.$container.height(this.height);

            this.tiles = [];
            this._generateTiles();

            // Listen for click events on tiles.
            $(document).on('puzzle:tile:click', (e, pos) => {
                this.move(pos.row, pos.col);
            });

            setTimeout(this.scramble.bind(this), TimeConstants.SCRAMBLE);
        }

        _generateTiles() {
            let tileSize = this.width / this.size;
            for (let row = 0; row < this.size; row++) {
                this.tiles.push([]);
                for (let col = 0; col < this.size; col++) {
                    let num = this.size * row + col + 1;

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
            let maxDistance = Math.max(row, col, this.size - row, this.size - col);

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
            let emptyTile = this.tiles[end.row][end.col];

            // Create a normalized direction vector.
            let direction = {
                r: start.row - end.row,
                c: start.col - end.col,
            };
            // Normalize
            if (direction.r != 0) direction.r /= Math.abs(direction.r);
            if (direction.c != 0) direction.c /= Math.abs(direction.c);

            let row = end.row;
            let col = end.col;
            while (row != start.row || col != start.col) {
                let nextRow = row + direction.r;
                let nextCol = col + direction.c;
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

            let emptyTile = this._findEmptyTileSameRowCol(row, col);
            if (emptyTile !== null) {
                this._moveTiles({row: row, col: col}, emptyTile);
                $(document).triggerHandler('puzzle:move');

                if (this._state === this._States.SCRAMBLED && this.isSolved()) {
                    this._state = this._States.SOLVED;
                    $(document).triggerHandler('puzzle:solved');
                    this._animateSolved();
                }
            }
        }

        isSolved() {
            for (let row = 0; row < this.size; row++) {
                for (let col = 0; col < this.size; col++) {
                    let num = row * this.size + col + 1;
                    if (this.tiles[row][col].number !== num) {
                        return false;
                    }
                }
            }

            return true;
        }

        _generateEmptyMatrix(size) {
            let matrix = [];
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
            let newTiles = this._generateEmptyMatrix(this.size);
            for (let row = 0; row < this.size; row++) {
                for (let col = 0; col < this.size; col++) {
                    let curTile = this.tiles[row][col];
                    let curNum = curTile.number;
                    let curRow = Math.floor((curNum - 1) / this.size);
                    let curCol = (curNum - 1) % this.size;

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
            this._state = this._States.SCRAMBLING;
            this._hideEmptyTile();

            let numTiles = this.size * this.size;
            let numMoves = 30 * numTiles;

            let pos = this._findEmptyTile();
            let emptyTile = this.tiles[pos.row][pos.col];
            for (let i = 0; i < numMoves; i++) {
                let row = emptyTile.row;
                let col = emptyTile.col;
                let direction = Math.floor(4 * Math.random());

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
            let pos = this._findEmptyTile();
            this.tiles[pos.row][pos.col].hide();
        }

        _animateSolved() {
            for (let row of this.tiles) {
                for (let tile of row) {
                    tile.animateSolved();
                }
            }
        }
    }

    return Puzzle;
})();


// Create React components.
class MoveCounter extends React.Component {
    constructor() {
        super();

        this.state = {
            count: 0
        };

        $(document).on('puzzle:move', () => {
            this.setState({count: this.state.count + 1});
        });

        $(document).on('puzzle:scramble', () => {
            this.setState({count: 0});
        });
    }

    render() {
        return (
            <h3>Moves: {this.state.count}</h3>
        );
    }
}

class TimeCounter extends React.Component {
    constructor() {
        super();

        this.state = {
            isTiming: false,
            start: null,
            label: '0:0.0',
        };

        $(document).on('puzzle:move', () => {
            if (!this.state.isTiming) {
                this.setState({
                    isTiming: true,
                    start: new Date(),
                });
            }
        });

        $(document).on('puzzle:scramble', () => {
            this.setState({
                isTiming: false,
                start: null,
                label: '0:0.0',
            });
        });

        $(document).on('puzzle:solved', () => {
            this.setState({
                isTiming: false,
            });
        });

        // If we used 100 ms exactly the 2nd millisecond digit on the clock
        // would never change. Instead we use an interval slightly under 100 ms.
        setInterval(this.updateTime.bind(this), 93);
    }

    // Formats a number to be 2 digits.
    _formatTwoDigits(num) {
        num = Math.floor(num);
        if (num < 10) {
            return '0' + num;
        }

        return String(num);
    }

    updateTime() {
        if (!this.state.isTiming) {
            return;
        }

        // Subtraction using JavaScript's Date object just gives us a time in
        // milliseconds, so we have to do some manual math here.
        let elapsed = new Date() - this.state.start;
        let milliSeconds = this._formatTwoDigits((elapsed % 1000) / 10);
        let seconds = this._formatTwoDigits((elapsed / 1000) % 60);
        let minutes = Math.floor(elapsed / 1000 / 60);
        let label = `${minutes}:${seconds}.${milliSeconds}`;

        this.setState({label: label});
    }

    render() {
        return (
            <h3>Time: {this.state.label}</h3>
        );
    }
}

class Controls extends React.Component {
    render() {
        return (
            <div>
                <button
                    onClick={this.props.puzzle.scramble.bind(this.props.puzzle)}
                    className='btn btn-lg btn-wide btn-primary'
                >
                    Scramble
                </button>
                <TimeCounter />
                <MoveCounter />
            </div>
        );
    }
}


// Create puzzle instance.
let puzzle = new Puzzle({
    $container: $('#puzzle'),
    size: 3,
});

// Render controls.
ReactDOM.render(
    <Controls puzzle={puzzle}/>,
    document.getElementById('controls')
);
