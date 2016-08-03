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
            this.puzzle = opts.puzzle; // Parent puzzle

            this.$el = this._createTileDiv();
            this.$container.append(this.$el);
            this._setupClickHandler();

            if (!this.visible) {
                setTimeout(() => {
                    this._hide();
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

        _hide() {
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
                this.puzzle.move(this.row, this.col);

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
                        puzzle: this,
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

        findEmptyTile() {
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
            let emptyTile = this._findEmptyTileSameRowCol(row, col);
            if (emptyTile !== null) {
                this._moveTiles({row: row, col: col}, emptyTile);

                if (this._state === this._States.SCRAMBLED && this.isSolved()) {
                    this._state = this._States.SOLVED;
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

            let numTiles = this.size * this.size;
            let numMoves = 30 * numTiles;

            let pos = this.findEmptyTile();
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


let puzzle = new Puzzle({
    $container: $('#puzzle'),
    size: 3,
});
