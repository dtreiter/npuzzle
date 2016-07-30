let Puzzle = (() => {
    class Tile {
        constructor(opts) {
            this.$container = opts.$container;
            this.row = opts.row;
            this.col = opts.col;
            this.size = opts.size;
            this.number = opts.number;
            this.visible = opts.visible;

            this.Durations = {
                SLIDE: 80,
                FADE: 800,
                WAIT: 300,
            };

            this.$el = this._createTileDiv();
            this.$container.append(this.$el);
            this._setupClickHandler();

            if (!this.visible) {
                setTimeout(() => {
                    this._hide();
                }, this.Durations.WAIT);
            }
        }

        move(row, col) {
            let pos = this._getRectPosition(row, col);
            move(this.$el[0])
                .set('left', pos.x)
                .set('top', pos.y)
                .duration(this.Durations.SLIDE)
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
                .duration(this.Durations.FADE)
                .end();
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
            this.$el.on('click', () => {
                puzzle.move(this.row, this.col);
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
            this.height = this.$container.height();

            this.tiles = [];
            this._generateTiles();
        }

        _generateTiles() {
            let tileSize = this.width / this.size;
            for (let row = 0; row < this.size; row++) {
                this.tiles.push([]);
                for (let col = 0; col < this.size; col++) {
                    let num = this.size * row + col + 1;

                    let visible = true;
                    if (num == this.size * this.size) {
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

        /*
         * Determines if the empty square is in the same row / col as the provided
         * (row, col). Returns the empty square's location if so.
         *
         * The basic algorithm is to start at (row, col) and step outward in all 4
         * directions looking for the empty tile.
         */
        _findEmptyTile(row, col) {
            // The max distance in any direction to the end of the puzzle.
            let maxDistance = Math.max(row, col, this.size - row, this.size - col);

            for (let i = 1; i < maxDistance; i++) {
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
            console.log(start, end);
        }

        move(row, col) {
            let emptyTile = this._findEmptyTile(row, col);
            if (emptyTile !== null) {
                this._moveTiles({row: row, col: col}, emptyTile);
            }
        }
    }

    return Puzzle;
})();


let puzzle = new Puzzle({
    $container: $('#puzzle'),
    size: 3,
});
