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
        this.width = opts.width;
        this.height = opts.height;

        let tileSize = this.width / this.size;
        this.tiles = [];
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

    move(row, col) {
        // TODO
        this.tiles[row][col].move(row, col + 1);
    }
}


let puzzle = new Puzzle({
    $container: $('#puzzle'),
    width: 300,
    height: 300,
    size: 3,
});
