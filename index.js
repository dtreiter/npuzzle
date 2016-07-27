class Tile {
    constructor(opts) {
        this.$container = opts.$container;
        this.row = opts.row;
        this.col = opts.col;
        this.size = opts.size;
        this.number = opts.number;
        this.visible = opts.visible;

        this.animationSpeed = 80;

        this.$el = this._createTileDiv();

        this.$container.append(this.$el);
        this._setupClickHandler();

        if (!this.visible) {
            this._hide();
        }
    }

    move(row, col) {
        let rectPos = this._getRectPosition(row, col);
        move(this.$el[0])
            .set('left', rectPos.x)
            .set('top', rectPos.y)
            .duration(this.animationSpeed)
            .end();

        this.row = row;
        this.col = col;
    }

    _hide() {
        setTimeout(() => {
            move(this.$el[0])
                .set('opacity', 0)
                .duration(1000)
                .end();
        }, 500)
    }

    _createTileDiv() {
        let rectPos = this._getRectPosition(this.row, this.col);
        return $('<div>')
            .html(String(this.number))
            .addClass('tile')
            .css({
                'width': String(this.size) + 'px',
                'height': String(this.size) + 'px',
                'line-height': String(this.size) + 'px',
                'left': rectPos.x,
                'top': rectPos.y,
            });
    }

    _setupClickHandler() {
        this.$el.on('click', () => {
            puzzle.move(this.col, this.row);
        });
    }

    _getRectPosition(row, col) {
        return {
            x: this.size * row,
            y: this.size * col,
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
        for (let i = 0; i < this.size; i++) {
            this.tiles.push([]);
            for (let j = 0; j < this.size; j++) {
                let num = this.size * j + i + 1;

                let visible = true;
                if (num == this.size * this.size) {
                    // The empty space is represented as a hidden tile for simplicity.
                    visible = false;
                }

                this.tiles[i].push(new Tile({
                    $container: this.$container,
                    visible: visible,
                    size: tileSize,
                    row: i,
                    col: j,
                    number: num,
                }));
            }
        }

    }

    move(row, col) {
        // TODO
        this.tiles[col][row].move(row, col + 1);
    }
}


let puzzle = new Puzzle({
    $container: $('#puzzle'),
    width: 300,
    height: 300,
    size: 3,
});
